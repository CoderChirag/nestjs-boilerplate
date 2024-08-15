import { ITopicConfig, RecordMetadata } from "kafkajs";
import { IKafkaMessage } from "..";

export interface IQueueService {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	listTopics?(): Promise<string[]>;
	createTopic?(config: ITopicConfig): Promise<boolean>;
	// listQueues?(): Promise<string[]>;
	// createQueue?(config: unknown): Promise<boolean>;
}

export interface IPublisherService {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	publish?(topicName: string, message: IKafkaMessage): Promise<RecordMetadata[]>;
}
