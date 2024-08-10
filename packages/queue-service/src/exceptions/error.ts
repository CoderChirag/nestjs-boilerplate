export class QueueServiceError extends Error {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "QueueServiceError";
		this.data = data;
	}
}

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
