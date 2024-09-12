import apm from "elastic-apm-node";
import { Logger } from "@nestjs/common";
import { constants } from "src/constants";
import { SUPPORTED_CACHING_PROVIDERS } from "caching-service";
import { CachingServiceConfig } from "nestjs-caching-service";

export const redisConfig: CachingServiceConfig<typeof SUPPORTED_CACHING_PROVIDERS.REDIS> = {
	type: SUPPORTED_CACHING_PROVIDERS.REDIS,
	providerName: constants.CACHING_SERVICES.REDIS.PROVIDER_NAME,
	global: true,
	withTransactionLogger: true,
	config: {
		redisConfig: {
			path: process.env.REDIS_URL!,
			options: {
				keyPrefix: `${process.env.PROJECT_NAME}:`,
				connectionName: process.env.APP_NAME!,
			},
		},
		apm,
		logger: new Logger(constants.CACHING_SERVICES.REDIS.PROVIDER_NAME),
	},
};
