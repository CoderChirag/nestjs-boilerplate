import { Agent } from "elastic-apm-node";
import {
	Consumer,
	ConsumerConfig,
	ConsumerRunConfig,
	ConsumerSubscribeTopics,
	IHeaders,
	Kafka,
	KafkaMessage,
	Message,
} from "kafkajs";
import {
	DLQ_ERROR_SOURCES,
	DropFirst,
	IKafkaMessageProcessor,
	IKafkaMessageProcessorMessageArg,
	IKafkaSubscriptionConfig,
	InferKafkaMessageProcessorMessageArgValue,
	KafkaConsumerRunError,
	KafkaConsumerServiceError,
	KafkaProducerService,
} from "..";
import { Logger } from "@repo/utility-types";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { ICachingServiceInstance, SUPPORTED_CACHING_PROVIDERS } from "caching-service";

export class KafkaConsumerService {
	private _client: Kafka;
	private _producer: KafkaProducerService;
	private _schemaRegistry: SchemaRegistry;
	private _consumers: Consumer[] = [];

	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;
	private cachingService?: ICachingServiceInstance<typeof SUPPORTED_CACHING_PROVIDERS.REDIS>;

	constructor(
		_client: Kafka,
		_producer: KafkaProducerService,
		_schemaRegistry: SchemaRegistry,
		cachingService?: ICachingServiceInstance<typeof SUPPORTED_CACHING_PROVIDERS.REDIS>,
		logger?: Logger,
		transactionLogger?: Logger,
		apm?: Agent,
	) {
		this._client = _client;
		this._producer = _producer;
		this._schemaRegistry = _schemaRegistry;
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;
		this.cachingService = cachingService;
	}

	get consumers() {
		return this._consumers;
	}

	async disconnect() {
		try {
			await Promise.all(this._consumers.map(async (consumer) => await consumer.disconnect()));
			this.logger.log("[KafkaConsumer] Kafka Consumers Disconnected!!");
			await this.cachingService?.disconnect();
		} catch (e) {
			const err = new KafkaConsumerServiceError("Error disconnecting from Kafka Consumers", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async subscribe<T extends IKafkaMessageProcessor>(
		consumerConfig: ConsumerConfig,
		subscription: IKafkaSubscriptionConfig,
		processor: T,
		...args: DropFirst<Parameters<T>>
	) {
		const { topics, fromBeginning, dlqRequired, schemaEnabled } = subscription;
		const runConfig: ConsumerRunConfig = {
			eachMessage: async ({ message, topic, partition, heartbeat }) => {
				this.apm?.currentTransaction?.setLabel("kafka_consumer_topic", topic);
				let decodedMsg:
					| IKafkaMessageProcessorMessageArg<
							InferKafkaMessageProcessorMessageArgValue<Parameters<T>[0]>
					  >
					| undefined = undefined;
				try {
					const messageHeaders = this.parseMessageHeaders(message.headers || {});
					decodedMsg = await this.decodeMsg<
						InferKafkaMessageProcessorMessageArgValue<Parameters<T>[0]>
					>(topic, message, schemaEnabled);

					this.transactionLogger.log(
						`[KafkaConsumerService] [ConsumerRun - ${topic}] ----- EACHMESSAGES ----   ${JSON.stringify(
							{
								topic: topic,
								key: decodedMsg.key ? decodedMsg.key : "",
								value: decodedMsg.value ? decodedMsg.value : "",
								headers: messageHeaders,
								offset: message.offset,
								partition: partition,
							},
						)}`,
					);

					await this.sendHeartbeat(topic, heartbeat);

					try {
						await this.checkOffset(
							topic,
							consumerConfig.groupId,
							partition,
							parseInt(message.offset),
						);
					} catch (e) {
						return;
					}

					this.apm?.currentTransaction?.setLabel("kafka_consumer_key", decodedMsg.key);

					await this.runProcessor<T>(topic, processor, decodedMsg, ...args);

					await this.publishOffset(topic, consumerConfig.groupId, partition, message.offset);
				} catch (e) {
					let err = e;
					if (!(err instanceof KafkaConsumerRunError)) {
						err = new KafkaConsumerRunError(
							topic,
							e instanceof Error ? e.message : new Error(e?.toString() || "Unknown Error").message,
							e,
						);
						this.transactionLogger.error((err as KafkaConsumerRunError).message);
						this.apm?.captureError(err as KafkaConsumerRunError);
					}

					if (dlqRequired)
						await this.publishToDlq(topic, decodedMsg || message, err as KafkaConsumerRunError);
				}
			},
		};

		await this.consume(consumerConfig, { topics, fromBeginning }, runConfig);
	}

	private parseMessageHeaders(headers: IHeaders) {
		return Object.entries(headers).reduce(
			(acc, [key, value]) => {
				acc[key] = value?.toString();
				return acc;
			},
			{} as Record<string, string | undefined>,
		);
	}

	private async sendHeartbeat(topic: string, heartbeat: () => Promise<void>) {
		try {
			this.transactionLogger.log(
				`[KafkaConsumerService] [ConsumerRun - ${topic}] Sending Heartbeat...`,
			);
			await heartbeat();
		} catch (e) {
			const err = new KafkaConsumerRunError(
				topic,
				`Error in sending heartbeat while consuming message from topic - ${topic}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
		}
	}

	private async checkOffset(
		topic: string,
		consumerGroupId: string,
		partition: number,
		messageOffset: number,
	) {
		try {
			const topicOffset = await this.cachingService?.get(
				`${topic}:${consumerGroupId}:${partition}`,
			);
			if (topicOffset) {
				const offset = parseInt(topicOffset);
				if (messageOffset <= offset) {
					throw new Error(
						`Message offset is less than the last consumed offset for topic(${topic})`,
					);
				}
			}
		} catch (e) {
			const err = new KafkaConsumerRunError(
				topic,
				`Error checking offset for message from Kafka topic - ${topic}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private async publishOffset(
		topic: string,
		consumerGroupId: string,
		partition: number,
		offset: string,
	) {
		try {
			await this.cachingService?.set(`${topic}:${consumerGroupId}:${partition}`, offset);
		} catch (e) {
			const err = new KafkaConsumerRunError(
				topic,
				`Error publishing offset for message from Kafka topic - ${topic}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
		}
	}

	private async decodeMsg<T>(
		topic: string,
		message: KafkaMessage,
		schemaEnabled: boolean = false,
	): Promise<IKafkaMessageProcessorMessageArg<T>> {
		try {
			this.transactionLogger.log(
				`[KafkaConsumerService] [ConsumerRun - ${topic}] Decoding Message...`,
			);
			return {
				key: message.key?.toString() || "",
				value: message.value
					? schemaEnabled
						? ((await this._schemaRegistry.decode(message.value)) as T)
						: (JSON.parse(message.value?.toString()) as T)
					: ({} as T),
				headers: this.parseMessageHeaders(message.headers || {}),
			};
		} catch (e) {
			const err = new KafkaConsumerRunError(
				topic,
				`Error decoding message from Kafka topic - ${topic}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private async runProcessor<T extends IKafkaMessageProcessor>(
		topic: string,
		processor: T,
		msg: Parameters<T>[0],
		...args: DropFirst<Parameters<T>>
	) {
		try {
			this.transactionLogger.log(
				`[KafkaConsumerService] [ConsumerRun - ${topic}] Running Message Processor...`,
			);
			await processor(msg, ...args);
		} catch (e) {
			const err = new KafkaConsumerRunError(topic, `Error running message processor`, e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private async publishToDlq(
		topic: string,
		message: IKafkaMessageProcessorMessageArg<any> | KafkaMessage,
		error: KafkaConsumerRunError,
	) {
		try {
			this.transactionLogger.log(
				`[KafkaConsumerService] [ConsumerRun - ${topic}] Publishing to DLQ...`,
			);
			const dlqMsg: Omit<Message, "value"> & { value: unknown } = {
				key: message.key?.toString(),
				value: {
					body: message.value?.toString(),
					error: {
						name: error.name,
						data: error.data,
						message: error.message,
					},
					headers: this.parseMessageHeaders(message.headers || {}),
					error_source: DLQ_ERROR_SOURCES.CONSUMER,
				},
			};
			await this._producer.publish(`${topic}.DLQ`, dlqMsg);
		} catch (e) {
			const err = new KafkaConsumerRunError(
				topic,
				`Error publishing to DLQ for message from Kafka topic - ${topic}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
		}
	}

	private async consume(
		consumerConfig: ConsumerConfig,
		subscription: ConsumerSubscribeTopics,
		runConfig: ConsumerRunConfig,
	) {
		const consumer = this._client.consumer({
			sessionTimeout: 300000,
			heartbeatInterval: 3000,
			...consumerConfig,
		});

		await this.connect(consumer);
		await this.subscribeTopics(consumer, subscription);
		await this.run(consumer, subscription, runConfig);

		this.transactionLogger.log(
			`[KafkaConsumerService] Subscribed To Topics: ${subscription.topics.join(", ")}`,
		);

		this._consumers.push(consumer);
		return consumer;
	}

	private async connect(consumer: Consumer) {
		try {
			await consumer.connect();
		} catch (e) {
			const err = new KafkaConsumerServiceError("Error connecting to Kafka Consumer", e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private async subscribeTopics(consumer: Consumer, subscription: ConsumerSubscribeTopics) {
		try {
			await consumer.subscribe(subscription);
		} catch (e) {
			const err = new KafkaConsumerServiceError(
				`Error subscribing to topics - ${subscription.topics}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	private async run(
		consumer: Consumer,
		subscription: ConsumerSubscribeTopics,
		runConfig: ConsumerRunConfig,
	) {
		try {
			await consumer.run(runConfig);
		} catch (e) {
			const err = new KafkaConsumerRunError(
				subscription.topics.join(", "),
				`Error running Kafka Consumer for topics - ${subscription.topics}`,
				e,
			);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
