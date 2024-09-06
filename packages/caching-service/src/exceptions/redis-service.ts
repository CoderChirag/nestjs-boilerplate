import { CachingServiceError } from "./caching-service";

export class RedisServiceError extends CachingServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "RedisServiceError";
		this.data = data;
	}
}
