import { ServiceBusClient, ServiceBusMessage, ServiceBusSender } from "@azure/service-bus";
import { Logger } from "@repo/utility-types";
import { Agent } from "elastic-apm-node";
import { IASBQueueMessage } from "..";
import { ASBProducerServiceError } from "../exceptions/asb";

export class ASBProducerService {
	private readonly _logger: Logger;
	private readonly _apm?: Agent;

	private readonly _client: ServiceBusClient;

	constructor(client: ServiceBusClient, logger: Logger, apm?: Agent) {
		this._client = client;
		this._logger = logger;
		this._apm = apm;
	}

	async publish(queueName: string, message: IASBQueueMessage) {
		this._apm?.currentTransaction?.setLabel("asb_producer_queue", queueName);
		const span = this._apm?.startSpan("ASB", {
			exitSpan: true,
			...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
		});
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");

		this._logger.log(
			`[ASBProducerService] Publishing message to ${queueName}: ${JSON.stringify(message)}`,
		);

		const sender = this._client.createSender(queueName);
		try {
			await this.sendMessage(sender, message, queueName);
			this._logger.log(`[ASBProducerService] Published message to ${queueName}`);
			span?.setOutcome("success");
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

	private async sendMessage(
		sender: ServiceBusSender,
		message: IASBQueueMessage,
		queueName: string,
	) {
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
			if (message.scheduleTimeUtc) {
				const [sequenceNo] = await sender.scheduleMessages(messageData, message.scheduleTimeUtc);
				return sequenceNo;
			} else await sender.sendMessages(messageData);
		} catch (e) {
			const err = new ASBProducerServiceError("Error sending message to ASB", e);
			this._logger.error(err.message);
			this._apm?.captureError(err);
			throw err;
		}
	}
}
