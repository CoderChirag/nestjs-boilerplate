import {
	ProcessErrorArgs,
	ServiceBusClient,
	ServiceBusReceivedMessage,
	ServiceBusReceiver,
	SubscribeOptions,
} from "@azure/service-bus";
import { Logger } from "@repo/utility-types";
import { Agent } from "elastic-apm-node";
import {
	DropFirst,
	IASBConsumerConfig,
	IASBErrorProcessor,
	IASBMessageProcessor,
	IASBMessageProcessorMessageArg,
	InferASBMessageProcessorMessageArgValue,
} from "../types";
import { ASBConsumerProcessorError, ASBConsumerServiceError } from "../exceptions/asb";

export class ASBConsumerService {
	private readonly _logger: Logger;
	private readonly _apm?: Agent;

	private readonly _client: ServiceBusClient;
	private _consumers: ServiceBusReceiver[] = [];

	constructor(client: ServiceBusClient, logger: Logger, apm?: Agent) {
		this._client = client;
		this._logger = logger;
		this._apm = apm;
	}

	get consumers() {
		return this._consumers;
	}

	async disconnect() {
		try {
			await Promise.all(this._consumers.map(async (consumer) => await consumer.close()));
			this._logger.log("[ASBConsumer] ASB Consumers Disconnected!!");
		} catch (e) {
			const err = new ASBConsumerServiceError("Error disconnecting from ASB Consumers", e);
			this._logger.error(err.message);
			this._apm?.captureError(err);
			throw err;
		}
	}

	async defaultErrorProcessor(error: ASBConsumerProcessorError) {
		this._logger?.error(
			`[ASBConsumerErrorProcessor] Error Occurred in ASB Consumer ${JSON.stringify(error)}`,
		);
	}

	async subscribe<T extends IASBMessageProcessor>(
		consumerConfig: IASBConsumerConfig,
		messageProcessor: T,
		errorProcessor: IASBErrorProcessor = this.defaultErrorProcessor,
		subscriptionConfig: SubscribeOptions = {},
		...args: DropFirst<Parameters<T>>
	) {
		const queue =
			"queueName" in consumerConfig ? consumerConfig.queueName : consumerConfig.topicName;
		let queueReceiver: ServiceBusReceiver;
		if ("queueName" in consumerConfig) {
			queueReceiver = this._client.createReceiver(consumerConfig.queueName, consumerConfig.options);
		} else {
			queueReceiver = this._client.createReceiver(
				consumerConfig.topicName,
				consumerConfig.subscriptionName,
				consumerConfig.options,
			);
		}

		queueReceiver.subscribe(
			{
				processMessage: async (messageResponse) => {
					return await this.processMessage(
						consumerConfig,
						messageProcessor,
						messageResponse,
						...args,
					);
				},
				processError: async (errorArgs) => {
					return await this.processError(consumerConfig, errorProcessor, errorArgs);
				},
			},
			subscriptionConfig,
		);

		this._logger.log(`[ASBConsumerService] Subscribed To ASB QUEUE: ${queue}`);
		this._consumers.push(queueReceiver);
	}

	private async processMessage<T extends IASBMessageProcessor>(
		consumerConfig: IASBConsumerConfig,
		messageProcessor: T,
		messageResponse: ServiceBusReceivedMessage,
		...args: DropFirst<Parameters<T>>
	) {
		const queue =
			"queueName" in consumerConfig ? consumerConfig.queueName : consumerConfig.topicName;
		const { transaction, span } = this.setupTransaction(consumerConfig, messageResponse);

		this._logger.log(
			`[ASBConsumerService] [ConsumerRun - ${queue}] -----  ${JSON.stringify({
				queue,
				messageId: messageResponse.messageId,
				subject: messageResponse.subject,
				contentType: messageResponse.contentType,
				corelationId: messageResponse.correlationId,
				partitionKey: messageResponse.partitionKey,
				applicationProperties: messageResponse.applicationProperties,
				message: messageResponse.body,
			})}`,
		);

		try {
			await messageProcessor(
				messageResponse as IASBMessageProcessorMessageArg<
					InferASBMessageProcessorMessageArgValue<Parameters<T>[0]>
				>,
				...args,
			);
			span?.setOutcome("success");
		} catch (e) {
			span?.setOutcome("failure");
			this._logger.error("[ASBConsumerService] Error while processing message");
			throw e;
		} finally {
			span?.end();
			transaction?.end();
		}
	}

	private setupTransaction(
		consumerConfig: IASBConsumerConfig,
		messageResponse: ServiceBusReceivedMessage,
	) {
		const queue =
			"queueName" in consumerConfig ? consumerConfig.queueName : consumerConfig.topicName;

		const transaction = this._apm?.startTransaction(
			`ASB Consumer - ${"queueName" in consumerConfig ? consumerConfig.queueName : `topicName: ${consumerConfig.topicName}, subscriptionName: ${consumerConfig.subscriptionName}`}`,
			"messaging",
			{
				childOf:
					messageResponse.applicationProperties?.traceparent?.toString() ||
					this._apm?.currentTraceparent?.toString(),
			},
		);
		transaction?.setLabel("asb_consumer_queue", queue);
		const span = transaction?.startSpan(
			`Processing ASB Message - ${queue}`,
			"messaging",
			"asb",
			"receive",
			{ exitSpan: true },
		);
		span?.setServiceTarget("ASB", queue);
		span?.setLabel("asb_consumer_message_subject", messageResponse.subject);
		span?.setLabel("asb_consumer_message_body", JSON.stringify(messageResponse.body));

		return { transaction, span };
	}

	private async processError(
		consumerConfig: IASBConsumerConfig,
		errorProcessor: IASBErrorProcessor,
		errorArgs: ProcessErrorArgs,
	) {
		const err = new ASBConsumerProcessorError({
			message: `Error while processing Queue(${"queueName" in consumerConfig ? consumerConfig.queueName : `topicName: ${consumerConfig.topicName}, subscriptionName: ${consumerConfig.subscriptionName}`}),errorSource(${errorArgs.errorSource}), entityPath(${errorArgs.entityPath}), namespace(${errorArgs.fullyQualifiedNamespace}): ${errorArgs.error.message}}`,
			queueName:
				"queueName" in consumerConfig
					? consumerConfig.queueName
					: `topicName: ${consumerConfig.topicName}, subscriptionName: ${consumerConfig.subscriptionName}`,
			errorSource: errorArgs.errorSource,
			entityPath: errorArgs.entityPath,
			namespace: errorArgs.fullyQualifiedNamespace,
			error: errorArgs.error,
		});
		this._apm?.captureError(err);
		this._logger.error(err.message);
		return await errorProcessor(err);
	}

	async deleteMessage<T>(queueName: string, message: IASBMessageProcessorMessageArg<T>) {
		const span = this._apm?.startSpan(`ASB Delete Message from Queue(${queueName})`, {
			exitSpan: true,
			...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
		});
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");
		span?.setLabel("asb_delete_message_queue", queueName);
		span?.setLabel(
			"asb_delete_message_headers",
			JSON.stringify(message.applicationProperties) || "",
		);
		span?.setLabel("asb_delete_message_id", message?.messageId?.toString() || "");
		span?.setLabel("asb_delete_message_subject", message.subject || "");
		span?.setLabel("asb_delete_message_body", JSON.stringify(message.body) || "");

		const receiver = this._client.createReceiver(queueName);
		try {
			await receiver.completeMessage(message);
			this._logger.log(`[ASBConsumerService] Message Deleted from Queue(${queueName})`);
			span?.setOutcome("success");
		} catch (e) {
			const err = new ASBConsumerServiceError(
				`Error deleting message from ASB Queue(${queueName})`,
				e,
			);
			this._logger.error(err.message);
			this._apm?.captureError(err);
			span?.setOutcome("failure");
			throw err;
		} finally {
			try {
				await receiver.close();
			} catch (e) {}
			span?.end();
		}
	}

	async abandonMessage<T>(queueName: string, message: IASBMessageProcessorMessageArg<T>) {
		const span = this._apm?.startSpan(`ASB Delete Message from Queue(${queueName})`, {
			exitSpan: true,
			...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
		});
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");
		span?.setLabel("asb_abandon_message_queue", queueName);
		span?.setLabel(
			"asb_abandon_message_headers",
			JSON.stringify(message.applicationProperties) || "",
		);
		span?.setLabel("asb_abandon_message_id", message?.messageId?.toString() || "");
		span?.setLabel("asb_abandon_message_subject", message.subject || "");
		span?.setLabel("asb_abandon_message_body", JSON.stringify(message.body) || "");

		const receiver = this._client.createReceiver(queueName);
		try {
			await receiver.abandonMessage(message);
			this._logger.log(`[ASBConsumerService] Message Abandoned from Queue(${queueName})`);
			span?.setOutcome("success");
		} catch (e) {
			const err = new ASBConsumerServiceError(
				`Error abandoning message from ASB Queue(${queueName})`,
				e,
			);
			this._logger.error(err.message);
			this._apm?.captureError(err);
			span?.setOutcome("failure");
			throw err;
		} finally {
			try {
				await receiver.close();
			} catch (e) {}
			span?.end();
		}
	}

	async deadLetterMessage<T>(queueName: string, message: IASBMessageProcessorMessageArg<T>) {
		const span = this._apm?.startSpan(`ASB Move Message to DLQ Queue(${queueName})`, {
			exitSpan: true,
			...(this._apm?.currentTraceparent ? { childOf: this._apm?.currentTraceparent } : {}),
		});
		span?.setServiceTarget("Message Queue", "ASB");
		span?.setType("messaging");
		span?.setLabel("asb_dlq_message_queue", queueName);
		span?.setLabel("asb_dlq_message_headers", JSON.stringify(message.applicationProperties) || "");
		span?.setLabel("asb_dlq_message_id", message?.messageId?.toString() || "");
		span?.setLabel("asb_dlq_message_subject", message.subject || "");
		span?.setLabel("asb_dlq_message_body", JSON.stringify(message.body) || "");

		const receiver = this._client.createReceiver(queueName);
		try {
			await receiver.deadLetterMessage(message);
			this._logger.log(`[ASBConsumerService] Message Moved to DLQ from Queue(${queueName})`);
			span?.setOutcome("success");
		} catch (e) {
			const err = new ASBConsumerServiceError(
				`Error moving message to dlq from ASB Queue(${queueName})`,
				e,
			);
			this._logger.error(err.message);
			this._apm?.captureError(err);
			span?.setOutcome("failure");
			throw err;
		} finally {
			try {
				await receiver.close();
			} catch (e) {}
			span?.end();
		}
	}
}
