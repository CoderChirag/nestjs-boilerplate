import apm from "elastic-apm-node";
import { Logger } from "@nestjs/common";
import { QueueConfig } from "nestjs-queue-service";
import { SUPPORTED_QUEUES } from "queue-service";
import { constants } from "src/constants";

export const kafkaQueueConfig: QueueConfig<typeof SUPPORTED_QUEUES.KAFKA> = {
	type: SUPPORTED_QUEUES.KAFKA,
	providerName: constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME,
	withTransactionLogger: true,
	config: {
		kafkaConfig: {
			clientId: process.env.KAFKA_CLIENT_ID!,
			brokers: process.env.KAFKA_BROKERS!.split(","),
		},
		schemaRegistryConfig: {
			args: { host: process.env.SCHEMA_REGISTRY_HOST! },
		},
		logger: new Logger(constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME),
		apm,
		adminConfig: {},
		producerConfig: {
			allowAutoTopicCreation: true,
		},
		redisServiceConfig: {
			redisConfig: {
				path: process.env.REDIS_URL!,
				options: {
					keyPrefix: `kafka-offsets:`,
					connectionName: `${process.env.APP_NAME}:kafka-offsets`,
				},
			},
			logger: new Logger(constants.CACHING_SERVICES.REDIS.PROVIDER_NAME),
			apm,
		},
	},
};

export const asbQueueConfig: QueueConfig<typeof SUPPORTED_QUEUES.ASB> = {
	type: SUPPORTED_QUEUES.ASB,
	providerName: constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME,
	withTransactionLogger: true,
	config: {
		connectionString: process.env.ASB_CONNECTION_STRING!,
		logger: new Logger(constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME),
		apm,
	},
};
