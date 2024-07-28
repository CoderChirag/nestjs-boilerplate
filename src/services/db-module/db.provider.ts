import { ConfigOptions } from "./db.module";
import { Provider } from "@nestjs/common";
import { DB_TYPES, IConfigModelsOrSchemas, DBService } from "src/utility/db-utility";

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
