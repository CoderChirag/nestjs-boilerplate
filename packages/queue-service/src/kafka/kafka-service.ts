import { Admin, Kafka } from "kafkajs";
import { IKafkaConfig, KafkaServiceError } from "..";
import { Agent } from "elastic-apm-node";
import { KafkaProducerService } from "./kafka-producer-service";
import { KafkaConsumerService } from "./kafka-consumer-service";

export class KafkaService {
	private _client: Kafka;
	private _admin: Admin;
	private _producer: KafkaProducerService;
	private _consumer: KafkaConsumerService;

	private logger: any;
	private apm?: Agent;

	constructor(config: IKafkaConfig) {
		const { kafkaConfig, apm, logger, adminConfig, producerConfig } = config;
		this._client = new Kafka(kafkaConfig);
		this.logger = logger ?? console;
		this.apm = apm;

		this._admin = this._client.admin(adminConfig ?? {});
		this._producer = new KafkaProducerService(this._client, producerConfig, this.logger, this.apm);
		this._consumer = new KafkaConsumerService(this._client, this.logger, this.apm);
	}

	async connect() {
		try {
			await this._admin.connect();
			this.logger.log("Connected to Kafka Admin!!");
		} catch (e) {
			const err = new KafkaServiceError("Error connecting to Kafka Admin", e);
			this.logger.error(`Error connecting to Kafka Admin: ${(e as Error)?.message}`);
			this.apm?.captureError(err, { captureAttributes: true });
			throw err;
		}
		await this._producer.connect();
	}
}
