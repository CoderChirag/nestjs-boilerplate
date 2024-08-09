import { AdminConfig, ConsumerConfig, KafkaConfig, ProducerConfig } from "kafkajs";
import { Agent } from "elastic-apm-node";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
export type Required<T extends Record<string, any>, K extends keyof T> = T & {
	[P in K]-?: T[P];
};

export type QUEUE_TYPES = (typeof SUPPORTED_QUEUES)[keyof typeof SUPPORTED_QUEUES];

export interface IKafkaConfig {
	kafkaConfig: Required<KafkaConfig, "clientId">;
	adminConfig?: AdminConfig;
	producerConfig?: ProducerConfig;
	consumerConfig?: ConsumerConfig;
	logger?: any;
	apm?: Agent;
}

export type PubSubServiceConfig<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? IKafkaConfig
	: never;
export type IPubSubServiceInstance<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? KafkaService
	: never;
