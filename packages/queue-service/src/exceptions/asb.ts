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
