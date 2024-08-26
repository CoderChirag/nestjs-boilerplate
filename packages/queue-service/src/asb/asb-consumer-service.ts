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
}
