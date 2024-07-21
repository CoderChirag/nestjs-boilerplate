import { DynamicModule, Module } from "@nestjs/common";
import { DB_TYPES, IConfigModelsOrSchemas, IDBConfigOptions } from "src/utility/db-utility/types";
import { DbServicesProvider } from "./db.service";

export type ConfigOptions<T extends DB_TYPES, S extends IConfigModelsOrSchemas> = IDBConfigOptions<
	T,
	S
> & { providerName: string };

@Module({})
export class DBServicesModule {
	static forRoot<T extends Record<string, ConfigOptions<DB_TYPES, IConfigModelsOrSchemas>>>(
		dbConfigs: T,
	): DynamicModule {
		return {
			module: DBServicesModule,
			providers: Object.values(dbConfigs).map((config) => DbServicesProvider(config)),
			exports: Object.values(dbConfigs).map((config) => config.providerName),
			global: true,
		};
	}
}
