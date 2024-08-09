import { Agent } from "elastic-apm-node";
import { Consumer, ConsumerConfig, Kafka } from "kafkajs";

export class KafkaConsumerService {
	private _client: Kafka;
	private _consumer: Consumer;

	private logger: any;
	private apm?: Agent;

	constructor(_client: Kafka, config?: ConsumerConfig, logger?: any, apm?: Agent) {
		this._client = _client;
		this.logger = logger ?? console;
		this.apm = apm;

		// this._consumer = this._client.consumer(config ?? {});
	}
}
