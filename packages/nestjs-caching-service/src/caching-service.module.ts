import { DynamicModule, Module } from "@nestjs/common";
import { CACHE_TYPES, ICachingServiceConfig } from "caching-service";
import { CachingServiceProvider } from "./caching-service.provider";

export interface CachingServiceConfig<T extends CACHE_TYPES> {
	type: T;
	providerName: string;
	global?: boolean;
	config: ICachingServiceConfig<T>;
}

@Module({})
export class CachingServiceModule {
	static forRoot<T extends CACHE_TYPES>(cachingConfig: CachingServiceConfig<T>): DynamicModule {
		return {
			module: CachingServiceModule,
			providers: [
				CachingServiceProvider(
					cachingConfig.providerName,
					cachingConfig.type,
					cachingConfig.config,
				),
			],
			exports: [cachingConfig.providerName],
			global: cachingConfig.global ?? true,
		};
	}
}
