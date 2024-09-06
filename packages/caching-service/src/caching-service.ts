import { Agent } from "elastic-apm-node";
import {
	CACHE_TYPES,
	ICachingServiceConfig,
	ICachingServiceInstance,
	IRedisServiceConfig,
} from "./types";
import { SUPPORTED_CACHING_PROVIDERS } from "./constants";
import { RedisService } from "./redis/redis-service";
import { CachingServiceError } from "./exceptions/caching-service";

export class CachingService<T extends CACHE_TYPES> {
	private _instance: ICachingServiceInstance<T>;

	constructor(type: T, config: ICachingServiceConfig<T>) {
		switch (type) {
			case SUPPORTED_CACHING_PROVIDERS.REDIS:
				(this._instance as any) = new RedisService(config as IRedisServiceConfig);
				break;
			default:
				const err = new CachingServiceError(`Caching Provider Type Not Supported: ${type}`);
				((config?.logger || console) as any).error(err.message);
				(config.apm as Agent)?.captureError(err);
				throw err;
		}
	}

	getInstance() {
		return this._instance;
	}
}
