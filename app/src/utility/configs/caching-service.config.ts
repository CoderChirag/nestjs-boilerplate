import apm from "elastic-apm-node";
import { Logger } from "@nestjs/common";
import { constants } from "src/constants";
import { SUPPORTED_CACHING_PROVIDERS } from "caching-service";
import { CachingServiceConfig } from "nestjs-caching-service";

export const redisConfig: CachingServiceConfig<typeof SUPPORTED_CACHING_PROVIDERS.REDIS> = {
	type: SUPPORTED_CACHING_PROVIDERS.REDIS,
	providerName: constants.INFRA.CACHING_SERVICES.REDIS.PROVIDER_NAME,
	global: true,
	config: {
		redisConfig: {},
		logger: new Logger("RedisService"),
		apm,
	},
};
