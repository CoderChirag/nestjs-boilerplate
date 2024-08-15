import { Agent } from "elastic-apm-node";
import {
	Consumer,
	ConsumerConfig,
	ConsumerRunConfig,
	ConsumerSubscribeTopics,
	Kafka,
} from "kafkajs";
import { KafkaConsumerRunError, KafkaConsumerServiceError, KafkaProducerService } from "..";
import { Logger } from "@repo/utility-types";

export class KafkaConsumerService {
	private _client: Kafka;
	private _producer: KafkaProducerService;
	private _consumers: Consumer[] = [];

	private logger: Logger;
	private apm?: Agent;

	constructor(_client: Kafka, _producer: KafkaProducerService, logger?: Logger, apm?: Agent) {
		this._client = _client;
		this._producer = _producer;
		this.logger = logger ?? console;
		this.apm = apm;
	}

	get consumers() {
		return this._consumers;
	}

	async subscribe(
		consumerConfig: ConsumerConfig,
		subscription: ConsumerSubscribeTopics,
		processor: (message: Object) => any,
	) {
		const runConfig: ConsumerRunConfig = {
			eachMessage: async ({ message, topic, partition, heartbeat }) => {
				const transaction = this.apm?.startTransaction(`Kafka Consumer - ${topic}`, {
					childOf: message.headers?.traceparent?.toString(),
				});
				const span = transaction?.startSpan(`Processing Kafka Message - ${topic}`);
				try {
					this.logger.log(
						`[KafkaConsumerService] [ConsumerRun - ${topic}] ----- EACHMESSAGES ----   ${JSON.stringify(
							{
								topic: topic,
								key: message.key ? message.key.toString() : "",
								value: message.value ? message.value.toString() : "",
								headers: message.headers,
								offset: message.offset,
								partition: partition,
							},
						)}`,
					);

					try {
						this.logger.log(`[KafkaConsumerService] [ConsumerRun - ${topic}] Sending Heartbeat...`);
						await heartbeat();
					} catch (e) {
						const err = new KafkaConsumerRunError(
							topic,
							`Error in sending heartbeat while consuming message from topic - ${topic}`,
							e,
						);
						this.logger.error(err.message);
						this.apm?.captureError(err);
					}

					try {
						this.logger.log(`[KafkaConsumerService] [ConsumerRun - ${topic}] Decoding Message...`);
						const msg = JSON.parse(message?.value?.toString() || "{}");
					} catch (e) {
						const err = new KafkaConsumerRunError(
							topic,
							`Error decoding message from Kafka topic - ${topic}`,
							e,
						);
						this.logger.error(err.message);
						this.apm?.captureError(err);
						throw err;
					}

					try {
						this.logger.log(
							`[KafkaConsumerService] [ConsumerRun - ${topic}] Running Message Processor...`,
						);
						await processor(message);
					} catch (e) {
						const err = new KafkaConsumerRunError(
							topic,
							`Error running message processor on Kafka topic - ${topic}`,
							e,
						);
						this.logger.error(err.message);
						this.apm?.captureError(err);
						throw err;
					}
				} catch (e) {
					let err = e;
					if (!(err instanceof KafkaConsumerRunError)) {
						err = new KafkaConsumerRunError(
							topic,
							e instanceof Error ? e.message : new Error(e?.toString() || "Unknown Error").message,
							e,
						);
						this.logger.error((err as KafkaConsumerRunError).message);
						this.apm?.captureError(err as KafkaConsumerRunError);
					}

					await this.publishToDlq(topic, err as KafkaConsumerRunError);
				} finally {
					span?.end();
					transaction?.end();
				}
			},
		};

		this.consume(consumerConfig, subscription, runConfig);
	}

	private async publishToDlq(topic: string, e: KafkaConsumerRunError) {}

	async consume(
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

		this._consumers.push(consumer);
		return consumer;
	}

	private async connect(consumer: Consumer) {
		try {
			await consumer.connect();
		} catch (e) {
			const err = new KafkaConsumerServiceError("Error connecting to Kafka Consumer", e);
			this.logger.error(err.message);
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
			this.logger.error(err.message);
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
			const err = new KafkaConsumerServiceError(
				`Error running Kafka Consumer for topics - ${subscription.topics}`,
				e,
			);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
