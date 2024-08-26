import { QueueServiceError } from "./queue";

export class ASBServiceError extends QueueServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "ASBServiceError";
		this.data = data;
	}
}

export class ASBProducerServiceError extends ASBServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "ASBProducerServiceError";
		this.data = data;
	}
}

export class ASBConsumerServiceError extends ASBServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "ASBConsumerServiceError";
		this.data = data;
	}
}

export class ASBConsumerProcessorError extends ASBConsumerServiceError {
	name: string;
	queueName: string;
	errorSource: string;
	entityPath: string;
	namespace: string;
	error: Error;

	constructor(error: {
		message: string;
		queueName: string;
		errorSource: string;
		entityPath: string;
		namespace: string;
		error: Error;
	}) {
		super(`${error.message}${error.error ? `: ${error.error.toString()}` : ""}`);
		this.name = "ASBConsumerProcessorError";
		this.queueName = error.queueName;
		this.error = error.error;
		this.errorSource = error.errorSource;
		this.entityPath = error.entityPath;
		this.namespace = error.namespace;
	}
}
