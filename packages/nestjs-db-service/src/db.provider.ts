import { ConfigOptions } from "./db.module";
import { Provider } from "@nestjs/common";
import { DB_TYPES, IConfigModelsOrSchemas, DBService, SUPPORTED_DBS } from "db-service";
import { Logger } from "nestjs-pino";

export const DBProvider = <T extends DB_TYPES, S extends IConfigModelsOrSchemas>(
	config: ConfigOptions<T, S>,
): Provider => {
	return {
		provide: config.providerName,
		useFactory: config.withTransactionLogger
			? async (logger: Logger) => {
					config.transactionLogger = logger;
					if (config.type === SUPPORTED_DBS.SQL && config.dialectOptions?.logging)
						config.dialectOptions.logging = logger.log.bind(logger);
					return await dbServiceFactory(config);
				}
			: async () => await dbServiceFactory(config),
		...(config.withTransactionLogger && { inject: [Logger] }),
	};
};

async function dbServiceFactory<T extends DB_TYPES, S extends IConfigModelsOrSchemas>(
	config: ConfigOptions<T, S>,
) {
	const dbService = new DBService<T, S>(config).getDbInstance();
	await dbService.connect();
	dbService.onApplicationShutdown = async () => {
		await dbService.closeConnection();
	};
	return dbService;
}
