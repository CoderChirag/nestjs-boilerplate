export class QueueServiceError extends Error {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "QueueServiceError";
		this.data = data;
	}
}
