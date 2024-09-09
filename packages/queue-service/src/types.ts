import { AdminConfig, KafkaConfig, ProducerConfig } from "kafkajs";
import { Agent } from "elastic-apm-node";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import { Logger } from "@repo/utility-types";
import { SchemaRegistryAPIClientArgs } from "@kafkajs/confluent-schema-registry/dist/api";
import { SchemaRegistryAPIClientOptions } from "@kafkajs/confluent-schema-registry/dist/@types";
import { COMPATIBILITY } from "@kafkajs/confluent-schema-registry";
import {
	ServiceBusClientOptions,
	ServiceBusReceivedMessage,
	ServiceBusReceiverOptions,
	TokenCredential,
} from "@azure/service-bus";
import { NamedKeyCredential, SASCredential } from "@azure/core-auth";
import { ASBService } from "./asb";
import { ASBConsumerProcessorError } from "./exceptions/asb";
import { ICachingServiceConfig, SUPPORTED_CACHING_PROVIDERS } from "caching-service";

export type Required<T extends Record<string, any>, K extends keyof T> = T & {
	[P in K]-?: T[P];
};
export type DropFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

export type QUEUE_TYPES = (typeof SUPPORTED_QUEUES)[keyof typeof SUPPORTED_QUEUES];

export interface IKafkaServiceConfig {
	kafkaConfig: Required<KafkaConfig, "clientId">;
	adminConfig?: AdminConfig;
	producerConfig?: ProducerConfig;
	schemaRegistryConfig: {
		args: SchemaRegistryAPIClientArgs;
		options?: SchemaRegistryAPIClientOptions;
	};
	logger?: Logger;
	apm?: Agent;
	redisServiceConfig?: ICachingServiceConfig<typeof SUPPORTED_CACHING_PROVIDERS.REDIS>;
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

export type IASBServiceConfig = (
	| {
			connectionString: string;
	  }
	| {
			namespace: string;
			credential: TokenCredential | NamedKeyCredential | SASCredential;
	  }
) & { options?: ServiceBusClientOptions; logger?: Logger; apm?: Agent };

export interface IASBQueueMessage {
	messageId?: string;
	subject?: string;
	body: object;
	scheduleTimeUtc?: Date;
	sourceRequestId?: string;
	traceparent?: string;
}

export type IASBQueuePublishReturnType<T extends IASBQueueMessage> =
	"scheduleTimeUtc" extends keyof T ? Long.Long : void;

export type IASBConsumerConfig =
	| { queueName: string; options?: ServiceBusReceiverOptions }
	| { topicName: string; subscriptionName: string; options?: ServiceBusReceiverOptions };

export type IASBMessageProcessorMessageArg<T> = Omit<ServiceBusReceivedMessage, "body"> & {
	body: T;
};

export type InferASBMessageProcessorMessageArgValue<T extends IASBMessageProcessorMessageArg<any>> =
	T extends IASBMessageProcessorMessageArg<infer K> ? K : never;

export type IASBMessageProcessor = (
	message: IASBMessageProcessorMessageArg<any>,
	...args: any[]
) => void | Promise<void>;

export type IASBErrorProcessor = (err: ASBConsumerProcessorError) => void | Promise<void>;

export type QueueServiceConfig<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? IKafkaServiceConfig
	: T extends typeof SUPPORTED_QUEUES.ASB
		? IASBServiceConfig
		: never;
export type IQueueServiceInstance<T extends QUEUE_TYPES> = T extends typeof SUPPORTED_QUEUES.KAFKA
	? KafkaService
	: T extends typeof SUPPORTED_QUEUES.ASB
		? ASBService
		: never;
