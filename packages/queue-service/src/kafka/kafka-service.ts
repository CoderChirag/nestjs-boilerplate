import { Admin, ITopicConfig, Kafka } from "kafkajs";
import { IKafkaConfig, KafkaServiceError } from "..";
import { Agent } from "elastic-apm-node";
import { KafkaProducerService } from "./kafka-producer-service";
import { KafkaConsumerService } from "./kafka-consumer-service";
import { IQueueService } from "../interfaces";
import { Logger } from "@repo/utility-types";

export class KafkaService implements IQueueService {
	private _client: Kafka;
	private _admin: Admin;
	private _producer: KafkaProducerService;
	private _consumer: KafkaConsumerService;

	private logger: Logger;
	private apm?: Agent;

	constructor(config: IKafkaConfig) {
		const { kafkaConfig, apm, logger, adminConfig, producerConfig } = config;
		this._client = new Kafka(kafkaConfig);
		this.logger = logger ?? console;
		this.apm = apm;

		this._admin = this._client.admin(adminConfig ?? {});
		this._producer = new KafkaProducerService(this._client, producerConfig, this.logger, this.apm);
		this._consumer = new KafkaConsumerService(this._client, this._producer, this.logger, this.apm);
	}

	async connect() {
		try {
			await this._admin.connect();
			this.logger.log("Connected to Kafka Admin!!");
		} catch (e) {
			const err = new KafkaServiceError("Error connecting to Kafka Admin", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
		await this._producer.connect();
	}

	async disconnect() {
		try {
			await this._admin.disconnect();
			this.logger.log("Kafka Admin Disconnected!!");
		} catch (e) {
			const err = new KafkaServiceError("Error disconnecting from Kafka Admin", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
		await this._producer.disconnect();
		await this._consumer.disconnect();
	}

	get producer() {
		return this._producer;
	}

	get consumer() {
		return this._consumer;
	}

	async listTopics() {
		try {
			return await this._admin.listTopics();
		} catch (e) {
			const err = new KafkaServiceError("Error listing topics", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async createTopics(config: ITopicConfig) {
		try {
			return await this._admin.createTopics({
				topics: [config],
			});
		} catch (e) {
			const err = new KafkaServiceError("Error creating topic", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
