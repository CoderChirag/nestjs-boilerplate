import { Agent } from "elastic-apm-node";
import { Kafka, Producer, ProducerConfig } from "kafkajs";
import { KafkaProducerServiceError } from "..";

export class KafkaProducerService {
	private _client: Kafka;
	private _producer: Producer;

	private logger: any;
	private apm?: Agent;

	constructor(_client: Kafka, config?: ProducerConfig, logger?: any, apm?: Agent) {
		this._client = _client;
		this.logger = logger ?? console;
		this.apm = apm;

		this._producer = this._client.producer(config ?? {});
	}

	async connect() {
		try {
			await this._producer.connect();
			this.logger.log("Connected to Kafka Producer!!");
		} catch (e) {
			const err = new KafkaProducerServiceError("Error connecting to Kafka Producer", e);
			this.logger.error(`Error connecting to Kafka Producer: ${(e as Error)?.message}`);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
