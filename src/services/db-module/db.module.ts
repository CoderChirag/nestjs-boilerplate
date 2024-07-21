import { DynamicModule, Global, Module, NestModule, Provider } from "@nestjs/common";
import { DB_TYPES } from "src/utility/db-utility/constants";
import { DBService } from "src/utility/db-utility/db.service";
import {
	DBConfigOptions,
	DbInstanceType,
	MongoSchemasType,
	SqlModelsType,
} from "src/utility/db-utility/types";

export type ConfigOptions<
	T extends DB_TYPES,
	S extends MongoSchemasType,
	K extends SqlModelsType,
> = DBConfigOptions<T, S, K> & { providerName: string };

// export type ProviderType<S> =
// 	S extends ConfigOptions<infer T, infer Z, infer K> ? DbInstanceType<T, Z, K> : never;

const provider = <S extends ConfigOptions<any, any, any>>(config: S): Provider => {
	return {
		provide: config.providerName,
		useFactory: async () => {
			const dbService = new DBService(config).getDbInstance();
			await dbService.connect();
			return dbService;
		},
	};
};

@Module({})
export class DBServicesModule {
	static forRootAsync<T extends Record<string, ConfigOptions<any, any, any>>>(
		dbConfigs: T,
	): DynamicModule {
		const providers = Object.entries(dbConfigs).map(([key, config]) => provider(config));
		return {
			module: DBServicesModule,
			providers,
			exports: Object.entries(dbConfigs).map(([key, config]) => config.providerName),
			global: true,
		};
	}
}
