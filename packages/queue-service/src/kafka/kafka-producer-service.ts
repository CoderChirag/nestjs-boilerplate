import { Agent } from "elastic-apm-node";
import { Kafka, Partitioners, Producer, ProducerConfig } from "kafkajs";
import { IPublisherService, KafkaProducerServiceError } from "..";
import { Logger } from "@repo/utility-types";

export interface IKafkaMessage {
	key: string;
	value: Object;
}

export class KafkaProducerService implements IPublisherService {
	private _client: Kafka;
	private _producer: Producer;

	private logger: Logger;
	private apm?: Agent;

	constructor(_client: Kafka, config?: ProducerConfig, logger?: Logger, apm?: Agent) {
		this._client = _client;
		this.logger = logger ?? console;
		this.apm = apm;

		this._producer = this._client.producer({
			createPartitioner: Partitioners.DefaultPartitioner,
			...config,
		});
	}

	async connect() {
		try {
			await this._producer.connect();
			this.logger.log("[KafkaProducerService] Connected to Kafka Producer!!");
		} catch (e) {
			const err = new KafkaProducerServiceError("Error connecting to Kafka Producer", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async disconnect() {
		try {
			await this._producer.disconnect();
		} catch (e) {
			const err = new KafkaProducerServiceError("Error disconnecting from Kafka Producer", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async publish(topicName: string, message: IKafkaMessage) {
		try {
			const { key, value } = message;
			const headers = {};
			this.apm?.currentTransaction?.setLabel("kafka.producer.topic", topicName);
			if (this.apm?.currentTransaction?.ids)
				headers["transaction"] = JSON.stringify(this.apm.currentTransaction.ids);

			this.logger.log(
				`[KafkaProducerService] Publishing message to ${topicName}: ${JSON.stringify(message)}`,
			);
			const result = await this._producer.send({
				topic: topicName,
				messages: [{ key, value: JSON.stringify(value), headers }],
			});
			this.logger.log(`[KafkaProducerService] Published message to ${topicName}`);
			return result;
		} catch (e) {
			const err = new KafkaProducerServiceError("Error publishing message to Kafka Producer", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
