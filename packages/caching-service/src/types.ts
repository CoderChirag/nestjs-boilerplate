import { Logger } from "@repo/utility-types";
import { Agent } from "elastic-apm-node";
import { RedisOptions } from "ioredis";
import { SUPPORTED_CACHING_PROVIDERS } from "./constants";
import { RedisService } from "./redis/redis-service";

export type CACHE_TYPES =
	(typeof SUPPORTED_CACHING_PROVIDERS)[keyof typeof SUPPORTED_CACHING_PROVIDERS];

export interface IRedisServiceConfig {
	redisConfig:
		| {
				port: number;
				host?: string;
				options?: RedisOptions;
		  }
		| {
				path: string;
				options?: RedisOptions;
		  }
		| {
				[key: string]: never;
		  };

	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}

export type ICachingServiceConfig<T extends CACHE_TYPES> =
	T extends typeof SUPPORTED_CACHING_PROVIDERS.REDIS ? IRedisServiceConfig : never;
export type ICachingServiceInstance<T extends CACHE_TYPES> =
	T extends typeof SUPPORTED_CACHING_PROVIDERS.REDIS ? RedisService : never;
