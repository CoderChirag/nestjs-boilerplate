import { DynamicModule, Module } from "@nestjs/common";
import { CreateAxiosDefaults } from "axios";
import { AxiosService } from "./axios.service";
import { Logger } from "nestjs-pino";

@Module({})
export class AxiosServiceModule {
	static forFeature(config: CreateAxiosDefaults, providerName: string): DynamicModule {
		return {
			module: AxiosServiceModule,
			providers: [
				{
					provide: providerName,
					useFactory: (logger: Logger) => new AxiosService(config, logger),
					inject: [Logger],
				},
			],
			exports: [providerName],
		};
	}
}
