import { DynamicModule, Module } from "@nestjs/common";
import { AxiosDefaults } from "axios";
import { AxiosUtilityService } from "./axios-utility.service";
import { Logger } from "nestjs-pino";

@Module({})
export class AxiosUtilityServiceModule {
	static forFeature(config: AxiosDefaults): DynamicModule {
		return {
			module: AxiosUtilityServiceModule,
			providers: [
				{
					provide: AxiosUtilityService,
					useFactory: (logger: Logger) => new AxiosUtilityService(config, logger),
					inject: [Logger],
				},
			],
			exports: [AxiosUtilityService],
		};
	}
}
