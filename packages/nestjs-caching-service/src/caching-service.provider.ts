import { Provider } from "@nestjs/common";
import { CACHE_TYPES, CachingService, ICachingServiceConfig } from "caching-service";
import { Logger } from "nestjs-pino";

export const CachingServiceProvider = <T extends CACHE_TYPES>(
	name: string,
	type: T,
	config: ICachingServiceConfig<T>,
	withTransactionLogger?: boolean,
): Provider => {
	return {
		provide: name,
		useFactory: withTransactionLogger
			? async (logger: Logger) => {
					config.transactionLogger = logger;
					return await cachingServiceFactory(type, config);
				}
			: async () => await cachingServiceFactory(type, config),
		...(withTransactionLogger ? { inject: [Logger] } : {}),
	};
};

async function cachingServiceFactory<T extends CACHE_TYPES>(
	type: T,
	config: ICachingServiceConfig<T>,
) {
	const cachingService = new CachingService<T>(type, config).getInstance();
	if ("connect" in cachingService && typeof cachingService.connect === "function")
		await cachingService.connect();

	(cachingService as any).onApplicationShutdown = async () => {
		if ("disconnect" in cachingService && typeof cachingService.disconnect === "function")
			await cachingService.disconnect();
	};
	return cachingService;
}
