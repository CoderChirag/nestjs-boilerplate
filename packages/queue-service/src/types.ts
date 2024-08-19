import { AdminConfig, KafkaConfig, ProducerConfig } from "kafkajs";
import { Agent } from "elastic-apm-node";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import { Logger } from "@repo/utility-types";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { SchemaRegistryAPIClientOptions } from "@kafkajs/confluent-schema-registry/dist/@types";
import { COMPATIBILITY } from "@kafkajs/confluent-schema-registry";

export type Required<T extends Record<string, any>, K extends keyof T> = T & {
	[P in K]-?: T[P];
};
export type DropFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

export type QUEUE_TYPES = (typeof SUPPORTED_QUEUES)[keyof typeof SUPPORTED_QUEUES];

export interface IKafkaConfig {
	kafkaConfig: Required<KafkaConfig, "clientId">;
	adminConfig?: AdminConfig;
	producerConfig?: ProducerConfig;
	schemaRegistryConfig: {
		args: SchemaRegistryAPIClientArgs;
		options?: SchemaRegistryAPIClientOptions;
	};
	logger?: Logger;
	apm?: Agent;
}

export interface ISchemaRegistryOptions {
	compatibility?: COMPATIBILITY;
	separator?: string;
	subject: string;
}

export interface IKafkaSubscriptionConfig {
	topics: (string | RegExp)[];
	fromBeginning?: boolean;
	dlqRequired?: boolean;
	schemaEnabled?: boolean;
}

export interface IKafkaMessageProcessorMessageArg<T> {
	key: string;
	value: T;
	headers: Record<string, string | undefined>;
}
export type InferKafkaMessageProcessorMessageArgValue<
	T extends IKafkaMessageProcessorMessageArg<any>,
> = T extends IKafkaMessageProcessorMessageArg<infer K> ? K : never;

export type IKafkaMessageProcessor = (
	message: IKafkaMessageProcessorMessageArg<any>,
	...args: any[]
) => unknown;

export type QueueServiceConfig<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? IKafkaConfig
	: never;
export type IQueueServiceInstance<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? KafkaService
	: never;
