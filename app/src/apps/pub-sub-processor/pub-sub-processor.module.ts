import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { DBModule } from "nestjs-db-service";
import { LoggerModule } from "nestjs-pino";
import { QueueModule } from "nestjs-queue-service";
import { AsyncExceptionFilter } from "src/filters/async-exception.filter";
import { DBServicesModule } from "src/services/db-services/db-services.module";
import { dbConfigs } from "src/utility/configs/db.config";
import { loggerConfigurations } from "src/utility/configs/logger-configuration";
import { kafkaQueueConfig } from "src/utility/configs/queue.config";
import { PubSubProcessorService } from "./pub-sub-processor.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TodosProcessorModule } from "src/modules/todos-processor/todos-processor.module";
import { ConfigurationServiceModule } from "src/services/configuration-service/configuration-service.module";
import {
	ProcessorAppEnvSchema,
	processorAppEnvTransformer,
} from "src/dtos/processor-app-env.schema";

@Module({
	imports: [
		LoggerModule.forRoot(loggerConfigurations),
		ConfigurationServiceModule.forRoot(
			ProcessorAppEnvSchema,
			process.env,
			processorAppEnvTransformer,
		),
		ScheduleModule.forRoot(),
		DBModule.forRoot(dbConfigs),
		QueueModule.forRoot(kafkaQueueConfig),
		DBServicesModule,
		TodosProcessorModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AsyncExceptionFilter,
		},
		PubSubProcessorService,
	],
})
export class PubSubProcessorModule {}
