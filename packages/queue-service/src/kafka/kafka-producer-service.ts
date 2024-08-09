import { Agent } from "elastic-apm-node";
import { Kafka, Producer, ProducerConfig } from "kafkajs";

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
}
