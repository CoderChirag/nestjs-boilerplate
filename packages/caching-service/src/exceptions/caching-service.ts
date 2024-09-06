export class CachingServiceError extends Error {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "CachingServiceError";
		this.data = data;
	}
}
