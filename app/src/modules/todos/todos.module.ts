import apm from "elastic-apm-node";
import { Logger, Module } from "@nestjs/common";
import { DBServicesModule } from "src/services/db-services/db-services.module";
import { TodosController } from "./v1/todos.controller";
import { TodosService } from "./v1/todos.service";
import { TodosControllerV2 } from "./v2/todos.controller";
import { TodosServiceV2 } from "./v2/todos.service";
import { QueueService } from "queue-service";

@Module({
	imports: [DBServicesModule],
	controllers: [TodosController, TodosControllerV2],
	providers: [
		TodosService,
		TodosServiceV2,
		{
			provide: "QUEUE_SERVICE",
			useFactory: async () => {
				const queue = new QueueService("kafka", {
					kafkaConfig: {
						clientId: "test",
						brokers: ["127.0.0.1:9092"],
					},
					logger: new Logger("QUEUE_SERVICE"),
					apm,
				}).getInstance();
				await queue.connect();
				return queue;
			},
		},
	],
})
export class TodosModule {}
