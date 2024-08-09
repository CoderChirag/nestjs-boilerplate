import { Admin, Kafka, KafkaConfig } from "kafkajs";
import { IKafkaConfig } from "..";
import { Agent } from "elastic-apm-node";

export class KafkaService {
	private _client: Kafka;
	private kafkaAdmin: Admin;

	private logger: any;
	private apm?: Agent;

	constructor(config: IKafkaConfig) {
		const { kafkaConfig, apm, logger, adminConfig } = config;
		this._client = new Kafka(kafkaConfig);
		this.logger = logger ?? console;
		this.apm = apm;

		this.kafkaAdmin = this._client.admin(adminConfig ?? {});
	}
}
