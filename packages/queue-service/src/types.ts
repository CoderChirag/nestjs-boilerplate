import { KafkaConfig } from "kafkajs";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
export type Required<T extends Record<string, any>, K extends keyof T> = T & {
	[P in K]-?: T[P];
};

export type QUEUE_TYPES = (typeof SUPPORTED_QUEUES)[keyof typeof SUPPORTED_QUEUES];
export type PubSubServiceConfig<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? Required<KafkaConfig, "clientId">
	: never;
export type IPubSubServiceInstance<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? KafkaService
	: never;
