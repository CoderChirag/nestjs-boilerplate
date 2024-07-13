import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { ReqResInterceptor } from "src/interceptors/request-response.interceptor";
import { HelloController } from "src/modules/hello/hello.controller";
import { HelloModule } from "src/modules/hello/hello.module";
import { loggerConfigurations } from "src/utility/logger-configuration";

@Module({
	imports: [LoggerModule.forRoot(loggerConfigurations), HelloModule],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: ReqResInterceptor,
		},
	],
})
export class ApiAppModule {}
