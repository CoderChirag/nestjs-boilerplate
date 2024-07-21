import { DynamicModule, Global, Module, NestModule, Provider } from "@nestjs/common";
import { DB_TYPES } from "src/utility/db-utility/constants";
import { DBService } from "src/utility/db-utility/db.service";
import { IDBConfigOptions, MongoSchemasType, SqlModelsType } from "src/utility/db-utility/types";

export type ConfigOptions<
	T extends DB_TYPES,
	S extends MongoSchemasType | SqlModelsType,
> = IDBConfigOptions<T, S> & { providerName: string };

const provider = <T extends DB_TYPES, S extends MongoSchemasType | SqlModelsType>(
	config: ConfigOptions<T, S>,
): Provider => {
	return {
		provide: config.providerName,
		useFactory: async () => {
			const dbService = new DBService<T, S>(config).getDbInstance();
			await dbService.connect();
			return dbService;
		},
	};
};

@Module({})
export class DBServicesModule {
	static forRootAsync<
		T extends Record<string, ConfigOptions<DB_TYPES, MongoSchemasType | SqlModelsType>>,
	>(dbConfigs: T): DynamicModule {
		const providers = Object.values(dbConfigs).map((config) => provider(config));
		return {
			module: DBServicesModule,
			providers,
			exports: Object.values(dbConfigs).map((config) => config.providerName),
			global: true,
		};
	}
}
