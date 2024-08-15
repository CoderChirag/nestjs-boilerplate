import { AdminConfig, KafkaConfig, ProducerConfig } from "kafkajs";
import { Agent } from "elastic-apm-node";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import { Logger } from "@repo/utility-types";
export type Required<T extends Record<string, any>, K extends keyof T> = T & {
	[P in K]-?: T[P];
};

export type QUEUE_TYPES = (typeof SUPPORTED_QUEUES)[keyof typeof SUPPORTED_QUEUES];

export interface IKafkaConfig {
	kafkaConfig: Required<KafkaConfig, "clientId">;
	adminConfig?: AdminConfig;
	producerConfig?: ProducerConfig;
	logger?: Logger;
	apm?: Agent;
}

export interface IKafkaProcessorMessageArg<T> {
	key: string;
	value: T;
	headers: Record<string, string | undefined>;
}

export type IKafkaMessageProcessor<T> = (message: IKafkaProcessorMessageArg<T>) => unknown;

export type QueueServiceConfig<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? IKafkaConfig
	: never;
export type IQueueServiceInstance<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? KafkaService
	: never;
