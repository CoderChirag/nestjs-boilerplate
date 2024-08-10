export class DBServiceError extends Error {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "DBServiceError";
		this.data = data;
	}
}

export class MongoServiceError extends DBServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "MongoServiceError";
		this.data = data;
	}
}

export class SqlServiceError extends DBServiceError {
	name: string;
	data: unknown;

	constructor(message: string, data?: unknown) {
		super(`${message}${data ? `: ${data.toString()}` : ""}`);
		this.name = "SqlServiceError";
		this.data = data;
	}
}
