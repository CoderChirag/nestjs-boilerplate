import apm from "elastic-apm-node";
import { Logger } from "@nestjs/common";
import { QueueConfig } from "nestjs-queue-service";
import { SUPPORTED_QUEUES } from "queue-service";
import { constants } from "src/constants";

export const kafkaQueueConfig: QueueConfig<typeof SUPPORTED_QUEUES.KAFKA> = {
	type: SUPPORTED_QUEUES.KAFKA,
	providerName: constants.QUEUE_SERVICES.KAFKA_SERVICE,
	config: {
		kafkaConfig: {
			clientId: process.env.KAFKA_CLIENT_ID!,
			brokers: process.env.KAFKA_BROKERS!.split(","),
		},
		logger: new Logger(constants.QUEUE_SERVICES.KAFKA_SERVICE),
		apm,
		adminConfig: {},
		producerConfig: {
			allowAutoTopicCreation: true,
		},
	},
};
