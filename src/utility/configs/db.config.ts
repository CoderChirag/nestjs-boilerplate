import { ConfigOptions as DbConfigOptions } from "src/services/db-module/db.module";
import { DB_TYPES, IConfigModelsOrSchemas, IDBConfigOptions } from "../db-utility/types";
import { constants } from "src/constants";
import { SUPPORTED_DBS } from "../db-utility/constants";
import { SCHEMAS } from "../models/mongo";
import { MODELS } from "../models/sql";
import { Logger } from "@nestjs/common";

export const dbConfigs: Record<string, DbConfigOptions<DB_TYPES, IConfigModelsOrSchemas>> = {
	mongo: {
		providerName: constants.DB_SERVICES.MONGO_DB_SERVICE,
		type: SUPPORTED_DBS.MONGO_DB,
		connectionString: process.env.MONGO_CONNECTION_STRING!,
		schemas: SCHEMAS.todos,
		logger: new Logger(constants.DB_SERVICES.MONGO_DB_SERVICE),
	},
	sql: {
		providerName: constants.DB_SERVICES.SQL_DB_SERVICE,
		type: SUPPORTED_DBS.SQL,
		connectionString: process.env.SQL_CONNECTION_STRING!,
		models: MODELS.todos,
		dialectOptions: {
			username: process.env.SQL_USERNAME!,
			password: process.env.SQL_PASSWORD!,
			database: process.env.SQL_DATABASE!,
			logging: console.log,
		},
		logger: new Logger(constants.DB_SERVICES.SQL_DB_SERVICE),
	},
};
