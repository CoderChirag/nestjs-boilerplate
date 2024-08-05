import { Kafka, KafkaConfig } from "kafkajs";

export class KafkaService {
	private _client: Kafka;

	constructor(config: KafkaConfig) {
		this._client = new Kafka(config);
	}
}
