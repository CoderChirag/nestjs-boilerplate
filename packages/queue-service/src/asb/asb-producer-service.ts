import { ServiceBusClient, ServiceBusMessage, ServiceBusSender } from "@azure/service-bus";
import { Logger } from "@repo/utility-types";
import { Agent } from "elastic-apm-node";
import { IASBQueueMessage, IASBQueuePublishReturnType } from "..";
import { ASBProducerServiceError } from "../exceptions/asb";

export class ASBProducerService {
	private readonly _logger: Logger;
	private readonly _transactionLogger: Logger;
	private readonly _apm?: Agent;

	private readonly _client: ServiceBusClient;

	constructor(client: ServiceBusClient, logger: Logger, transactionLogger: Logger, apm?: Agent) {
		this._client = client;
		this._logger = logger;
		this._transactionLogger = transactionLogger;
		this._apm = apm;
	}

	async publish<T extends IASBQueueMessage>(
		queueName: string,
		message: T,
	): Promise<IASBQueuePublishReturnType<T>> {
		this._apm?.currentTransaction?.setLabel("asb_producer_queue", queueName);
		const span = this._apm?.startSpan(`ASB SEND to ${queueName}`, {
			exitSpan: true,
			...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
		});
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");

		this._transactionLogger.log(
			`[ASBProducerService] Publishing message to ${queueName}: ${JSON.stringify(message)}`,
		);

		const sender = this._client.createSender(queueName);
		try {
			const res = await this.sendMessage<T>(sender, message, queueName);
			this._transactionLogger.log(`[ASBProducerService] Published message to ${queueName}`);
			span?.setOutcome("success");
			return res;
		} catch (e) {
			span?.setOutcome("failure");
			throw e;
		} finally {
			try {
				await sender.close();
			} catch (e) {}
			span?.end();
		}
	}

	private async sendMessage<T extends IASBQueueMessage>(
		sender: ServiceBusSender,
		message: IASBQueueMessage,
		queueName: string,
	): Promise<IASBQueuePublishReturnType<T>> {
		const { subject, body, messageId, scheduleTimeUtc, sourceRequestId } = message;
		const messageData: ServiceBusMessage = {
			...(messageId ? { messageId: messageId } : {}),
			...(scheduleTimeUtc ? { scheduledEnqueueTimeUtc: scheduleTimeUtc } : {}),
			subject: subject,
			body: body,
			contentType: "application/json",
			applicationProperties: {
				...(sourceRequestId ? { sourceRequestId: sourceRequestId } : {}),
				...(this._apm?.currentTraceparent ? { traceparent: this._apm?.currentTraceparent } : {}),
				...(this._apm?.currentTraceIds
					? { traceIds: JSON.stringify(this._apm?.currentTraceIds) }
					: {}),
				isScheduledMessage: scheduleTimeUtc ? true : false,
			},
		};

		try {
			if ("scheduleTimeUtc" in message) {
				if (!message.scheduleTimeUtc)
					throw new Error("scheduleTimeUtc is required for scheduled messages");
				const [sequenceNo] = await sender.scheduleMessages(messageData, message.scheduleTimeUtc);
				return sequenceNo as IASBQueuePublishReturnType<T>;
			} else {
				await sender.sendMessages(messageData);
				return undefined as IASBQueuePublishReturnType<T>;
			}
		} catch (e) {
			const err = new ASBProducerServiceError("Error sending message to ASB", e);
			this._transactionLogger.error(err.message);
			this._apm?.captureError(err);
			throw err;
		}
	}

	async cancelScheduledMessage(queueName: string, sequenceNo: Long.Long) {
		const span = this._apm?.startSpan(
			`ASB Cancel Scheduled Message: queueName: ${queueName}, sequenceNo: ${sequenceNo}`,
			{
				exitSpan: true,
				...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
			},
		);
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");
		span?.setLabel("asb_cancel_scheduled_message_queue", queueName);
		span?.setLabel("asb_cancel_scheduled_message", sequenceNo.toString());

		const sender = this._client.createSender(queueName);
		try {
			await sender.cancelScheduledMessages(sequenceNo);
			this._transactionLogger.log(
				`[ASBProducerService] Cancelled scheduled message in ${queueName}`,
			);
			span?.setOutcome("success");
		} catch (e) {
			const err = new ASBProducerServiceError(
				`Error cancelling scheduled message in ASB(${queueName}) for sequenceNo: ${sequenceNo}`,
				e,
			);
			this._transactionLogger.error(err.message);
			this._apm?.captureError(err);
			span?.setOutcome("failure");
			throw err;
		} finally {
			try {
				await sender.close();
			} catch (e) {}
			span?.end();
		}
	}
}
