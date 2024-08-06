import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggerModule } from "nestjs-pino";
import { HttpExceptionFilter } from "src/filters/http-exception.filter";
import { ReqResInterceptor } from "src/interceptors/request-response.interceptor";
import { TodosModule } from "src/modules/todos/todos.module";
import { DBModule } from "nestjs-db-service";
import { dbConfigs } from "src/utility/configs/db.config";
import { loggerConfigurations } from "src/utility/configs/logger-configuration";
import { ApiAppLifecycleService } from "./api-app-lifecycle.service";
import { CheckApiAppHealthModule } from "src/services/health-check-service/check-api-app-health.module";

@Module({
	imports: [
		LoggerModule.forRoot(loggerConfigurations),
		ConfigModule.forRoot({
			ignoreEnvFile: true,
			isGlobal: true,
		}),
		DBModule.forRoot(dbConfigs),
		EventEmitterModule.forRoot(),
		CheckApiAppHealthModule,
		TodosModule,
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
		ApiAppLifecycleService,
	],
})
export class ApiAppModule {}