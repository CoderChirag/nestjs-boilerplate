import { DynamicModule, Module } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { constants } from "src/constants";
import { ConfigurationService } from "./configuration-service.service";

@Module({})
export class ConfigurationServiceModule {
	static forRoot<T extends object>(
		schema: ClassConstructor<T>,
		env: object,
		transformer: (env: object) => object,
	): DynamicModule {
		return {
			module: ConfigurationServiceModule,
			global: true,
			providers: [
				{
					provide: constants.CONFIGURATION_SERVICE,
					useFactory: async () => {
						const configurationService = new ConfigurationService(schema, env, transformer);
						await configurationService.validate();
						return configurationService.config;
					},
				},
			],
			exports: [constants.CONFIGURATION_SERVICE],
		};
	}
}
