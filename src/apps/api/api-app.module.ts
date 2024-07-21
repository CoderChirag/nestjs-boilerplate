import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { constants } from "src/constants/constants";
import { HttpExceptionFilter } from "src/filters/http-exception.filter";
import { ReqResInterceptor } from "src/interceptors/request-response.interceptor";
import { HelloModule } from "src/modules/hello/hello.module";
import { DBServicesModule } from "src/services/db-module/db.module";
import { DB_TYPES, SUPPORTED_DBS } from "src/utility/db-utility/constants";
import { loggerConfigurations } from "src/utility/logger-configuration";
import { SCHEMAS } from "src/utility/models/mongo";
import { MODELS } from "src/utility/models/sql";

const configs = {
	mongo: {
		providerName: constants.DB_SERVICES.TODOS_MONGO_DB_SERVICE,
		type: SUPPORTED_DBS.MONGO_DB,
		connectionString: "mongodb://localhost:27017/test",
		schemas: SCHEMAS.todos,
	},
	sql: {
		providerName: constants.DB_SERVICES.TODOS_SQL_DB_SERVICE,
		type: SUPPORTED_DBS.SQL,
		connectionString: "mysql://127.0.0.1:3306",
		models: MODELS.todos,
		dialectOptions: {
			username: "root",
			password: "password123",
			database: "todos",
			logging: console.log,
		},
	},
};

@Module({
	imports: [
		LoggerModule.forRoot(loggerConfigurations),
		DBServicesModule.forRootAsync(configs),
		HelloModule,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: ReqResInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class ApiAppModule {}
