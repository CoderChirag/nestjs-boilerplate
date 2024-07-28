import { DB_TYPES, IConfigModelsOrSchemas } from "src/utility/db-utility/types";
import { ConfigOptions } from "./db.module";
import { Logger, Provider } from "@nestjs/common";
import { DBService } from "src/utility/db-utility/db.service";

export const DBProvider = <T extends DB_TYPES, S extends IConfigModelsOrSchemas>(
	config: ConfigOptions<T, S>,
): Provider => {
	return {
		provide: config.providerName,
		useFactory: async () => {
			const dbService = new DBService<T, S>(config).getDbInstance();
			await dbService.connect();
			dbService.onApplicationShutdown = async () => {
				await dbService.closeConnection();
			};
			return dbService;
		},
	};
};
