import apm from "elastic-apm-node";
import { ConfigOptions as DbConfigOptions } from "nestjs-db-service";
import { constants } from "src/constants";
import { SUPPORTED_DBS, DB_TYPES, IConfigModelsOrSchemas } from "db-service";
import { SCHEMAS } from "../models/mongo";
import { MODELS } from "../models/sql";
import { Logger } from "@nestjs/common";

export const dbConfigs: Record<string, DbConfigOptions<DB_TYPES, IConfigModelsOrSchemas>> = {
	mongo: {
		providerName: constants.DB_SERVICES.MONGO_DB_SERVICE.PROVIDER_NAME,
		withTransactionLogger: true,
		type: SUPPORTED_DBS.MONGO_DB,
		connectionString: process.env.MONGO_CONNECTION_STRING!,
		schemas: SCHEMAS.todos,
		logger: new Logger(constants.DB_SERVICES.MONGO_DB_SERVICE.PROVIDER_NAME),
		apm: apm,
	},
	sql: {
		providerName: constants.DB_SERVICES.SQL_DB_SERVICE.PROVIDER_NAME,
		withTransactionLogger: true,
		type: SUPPORTED_DBS.SQL,
		connectionString: process.env.SQL_CONNECTION_STRING!,
		models: MODELS.todos,
		dialectOptions: {
			username: process.env.SQL_USERNAME!,
			password: process.env.SQL_PASSWORD!,
			database: process.env.SQL_DATABASE!,
			logging: process.env.NODE_ENV === "local" ? console.log : undefined,
		},
		logger: new Logger(constants.DB_SERVICES.SQL_DB_SERVICE.PROVIDER_NAME),
		apm: apm,
	},
};
