import { Agent } from "elastic-apm-node";
import { Logger } from "@repo/utility-types";
import { Redis, RedisKey } from "ioredis";
import { IRedisServiceConfig } from "../types";
import { RedisServiceError } from "../exceptions/redis-service";

export class RedisService {
	private _client: Redis;

	private logger: Logger;
	private transactionLogger: Logger;
	private apm?: Agent;

	constructor(config: IRedisServiceConfig) {
		const { redisConfig, apm, logger, transactionLogger } = config;
		this.logger = logger ?? console;
		this.transactionLogger = transactionLogger ?? this.logger;
		this.apm = apm;

		if ("port" in redisConfig) {
			const { port, host, options } = redisConfig;

			if (host && options) this._client = new Redis(port, host, options);
			else if (host) this._client = new Redis(port, host);
			else if (options) this._client = new Redis(port, options);
			else this._client = new Redis(port);
		} else if ("path" in redisConfig) {
			const { path, options } = redisConfig;

			if (options) this._client = new Redis(path, options);
			else this._client = new Redis(path);
		} else this._client = new Redis();

		this._client.on("connecting", () => {
			this.logger.log("Connecting to Redis...");
		});

		this._client.on("connect", () => {
			this.logger.log(`Connected to redis: ${JSON.stringify(this._client.options)}`);
			if (!this._client.options.connectionName)
				this._client.client("SETNAME", process.env.APP_NAME!, (err, res) => {
					if (err) this.logger.error(`Failed to set client name for redis: ${err.message}`);
					else this.logger.log(`Redis Client name set to: ${process.env.APP_NAME}`);
				});
		});

		this._client.on("close", () => {
			this.logger.log("Redis connection closed");
		});

		this._client.on("error", (err: any) => {
			this.logger.error(`REDIS CONNECTION ERROR: ${err}`);
		});
	}

	async disconnect() {
		try {
			await this._client.disconnect();
		} catch (e) {
			const err = new RedisServiceError("Error disconnecting from redis", e);
			this.logger.error(err.message);
			this.apm?.captureError(err);
		}
	}

	async get(key: RedisKey) {
		try {
			return await this._client.get(key);
		} catch (e) {
			const err = new RedisServiceError(`Error getting key(${key})`, e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}

	async set(key: RedisKey, value: string | Buffer | number): Promise<"OK">;
	async set(key: RedisKey, value: string | Buffer | number, get: "GET"): Promise<string | null>;
	async set(key: RedisKey, value: string | Buffer | number, nx: "NX"): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(key: RedisKey, value: string | Buffer | number, xx: "XX"): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
	): Promise<"OK">;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
		nx: "NX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
		xx: "XX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		secondsToken: "EX",
		seconds: number | string,
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
	): Promise<"OK">;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
		nx: "NX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
		xx: "XX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		millisecondsToken: "PX",
		milliseconds: number | string,
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
	): Promise<"OK">;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
		nx: "NX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
		xx: "XX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeSecondsToken: "EXAT",
		unixTimeSeconds: number | string,
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
	): Promise<"OK">;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
		nx: "NX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
		xx: "XX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		unixTimeMillisecondsToken: "PXAT",
		unixTimeMilliseconds: number | string,
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(key: RedisKey, value: string | Buffer | number, keepttl: "KEEPTTL"): Promise<"OK">;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		keepttl: "KEEPTTL",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		keepttl: "KEEPTTL",
		nx: "NX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		keepttl: "KEEPTTL",
		nx: "NX",
		get: "GET",
	): Promise<string | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		keepttl: "KEEPTTL",
		xx: "XX",
	): Promise<"OK" | null>;
	async set(
		key: RedisKey,
		value: string | Buffer | number,
		keepttl: "KEEPTTL",
		xx: "XX",
		get: "GET",
	): Promise<string | null>;
	async set(...args: any[]) {
		try {
			return await (this._client.set as any)(...args);
		} catch (e) {
			const err = new RedisServiceError(`Error setting key(${args[0]})`, e);
			this.transactionLogger.error(err.message);
			this.apm?.captureError(err);
			throw err;
		}
	}
}
