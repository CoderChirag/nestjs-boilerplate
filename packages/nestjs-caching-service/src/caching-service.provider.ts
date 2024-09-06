import { Provider } from "@nestjs/common";
import { CACHE_TYPES, CachingService, ICachingServiceConfig } from "caching-service";

export const CachingServiceProvider = <T extends CACHE_TYPES>(
	name: string,
	type: T,
	config: ICachingServiceConfig<T>,
): Provider => {
	return {
		provide: name,
		useFactory: async () => {
			const cachingService = new CachingService<T>(type, config).getInstance();
			if ("connect" in cachingService && typeof cachingService.connect === "function")
				await cachingService.connect();

			(cachingService as any).onApplicationShutdown = async () => {
				if ("disconnect" in cachingService && typeof cachingService.disconnect === "function")
					await cachingService.disconnect();
			};
			return cachingService;
		},
	};
};
