import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { HttpExceptionFilter } from "src/filters/http-exception.filter";
import { ReqResInterceptor } from "src/interceptors/request-response.interceptor";
import { HelloModule } from "src/modules/hello/hello.module";
import { DBModule } from "src/services/db-module/db.module";
import { dbConfigs } from "src/utility/configs/db.config";
import { loggerConfigurations } from "src/utility/logger-configuration";

@Module({
	imports: [
		LoggerModule.forRoot(loggerConfigurations),
		ConfigModule.forRoot({
			ignoreEnvFile: true,
			isGlobal: true,
		}),
		DBModule.forRoot(dbConfigs),
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
