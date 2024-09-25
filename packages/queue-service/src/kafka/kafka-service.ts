import { Admin, ITopicConfig, Kafka } from "kafkajs";
import { IKafkaServiceConfig, ISchemaRegistryOptions, KafkaServiceError } from "..";
import { Agent } from "elastic-apm-node";
import { KafkaProducerService } from "./kafka-producer-service";
import { KafkaConsumerService } from "./kafka-consumer-service";
import { Logger } from "@repo/utility-types";
import { COMPATIBILITY, SchemaRegistry, readAVSCAsync } from "@kafkajs/confluent-schema-registry";
import { AvroConfluentSchema, RawAvroSchema } from "@kafkajs/confluent-schema-registry/dist/@types";
import { CachingService, SUPPORTED_CACHING_PROVIDERS } from "caching-service";

export class KafkaService {
	private _client: Kafka;
	private _admin: Admin;
	private _schemaRegistry: SchemaRegistry;
	private _producer: KafkaProducerService;
	private _consumer: KafkaConsumerService;

	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;

	constructor(config: IKafkaServiceConfig) {
		const {
			kafkaConfig,
			apm,
			logger,
			transactionLogger,
			adminConfig,
			producerConfig,
			schemaRegistryConfig,
			redisServiceConfig,
		} = config;
		this._client = new Kafka(kafkaConfig);
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;

		this._admin = this._client.admin(adminConfig ?? {});
		this._schemaRegistry = new SchemaRegistry(
			schemaRegistryConfig.args,
			schemaRegistryConfig.options,
		);
		this._producer = new KafkaProducerService(
			this._client,
			this._schemaRegistry,
			producerConfig,
			this.logger,
			this.transactionLogger,
			this.apm,
		);
		this._consumer = new KafkaConsumerService(
			this._client,
			this._producer,
			this._schemaRegistry,
			redisServiceConfig
				? new CachingService(SUPPORTED_CACHING_PROVIDERS.REDIS, {
						...redisServiceConfig,
						transactionLogger: this.transactionLogger,
					}).getInstance()
				: undefined,
			this.logger,
			this.transactionLogger,
			this.apm,
		);
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
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async createTopic(config: ITopicConfig) {
		try {
			const created = await this._admin.createTopics({
				topics: [config],
			});
			if (created) this.transactionLogger.log(`Topic initialized successfully: ${config.topic}`);
			else this.transactionLogger.log(`Topic already exists: ${config.topic}`);
			return created;
		} catch (e) {
			const err = new KafkaServiceError(`Error creating topic - ${config.topic}`, e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async deleteTopics(options: { topics: string[]; timeout?: number }) {
		try {
			await this._admin.deleteTopics(options);
		} catch (e) {
			const err = new KafkaServiceError(`Error deleting topics - ${options.topics}`, e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async registerSchema(
		filePath: string,
		topic: string,
		userOpts?: Omit<ISchemaRegistryOptions, "subject">,
	): Promise<number>;
	async registerSchema(
		schema: RawAvroSchema | AvroConfluentSchema,
		topic: string,
		userOpts?: Omit<ISchemaRegistryOptions, "subject">,
	): Promise<number>;
	async registerSchema(
		filePathOrSchema: string | RawAvroSchema | AvroConfluentSchema,
		topic: string,
		userOpts: Omit<ISchemaRegistryOptions, "subject"> = {},
	): Promise<number> {
		let schema: RawAvroSchema | AvroConfluentSchema;
		if (typeof filePathOrSchema === "string") {
			schema = await this.readAVSCSchema(filePathOrSchema);
		} else {
			schema = filePathOrSchema;
		}

		try {
			const { id } = await this._schemaRegistry.register(schema, {
				subject: topic,
				compatibility: COMPATIBILITY.FULL,
				...userOpts,
			});
			// this._schemaRegistry.
			this.transactionLogger.log(`Schema registered successfully - ${topic} with id: ${id}`);
			return id;
		} catch (err) {
			const error = new KafkaServiceError(`Error registering schema - ${topic}`, err);
			this.transactionLogger.error(error.message);
			this.apm?.captureError(error);
			throw error;
		}
	}

	private async readAVSCSchema(filePath: string): Promise<RawAvroSchema> {
		if (!filePath.endsWith(".avsc")) {
			const err = new KafkaServiceError("Invalid schema file type. Only .avsc files are allowed");
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}

		try {
			const schema = await readAVSCAsync(filePath);
			return schema;
		} catch (err) {
			const error = new KafkaServiceError("Error reading schema file", err);
			this.transactionLogger.error(error.message);
			this.apm?.captureError(error);
			throw error;
		}
	}
}
