import { QueueServiceError } from "./queue";

export class KafkaServiceError extends QueueServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "KafkaServiceError";
		this.data = data;
	}
}

export class KafkaProducerServiceError extends KafkaServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "KafkaProducerServiceError";
		this.data = data;
	}
}

export class KafkaConsumerServiceError extends KafkaServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "KafkaConsumerServiceError";
		this.data = data;
	}
}

export class KafkaConsumerRunError extends KafkaConsumerServiceError {
	name: string;
	data: unknown;

	constructor(topic: string, message: string, data?: unknown) {
		super(`[${topic}] ${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "KafkaConsumerRunError";
		this.data = data;
	}
}
