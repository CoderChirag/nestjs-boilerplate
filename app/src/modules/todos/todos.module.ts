import apm from "elastic-apm-node";
import { Logger, Module } from "@nestjs/common";
import { DBServicesModule } from "src/services/db-services/db-services.module";
import { TodosController } from "./v1/todos.controller";
import { TodosService } from "./v1/todos.service";
import { TodosControllerV2 } from "./v2/todos.controller";
import { TodosServiceV2 } from "./v2/todos.service";
import { QueueService } from "queue-service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

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
				await queue.consumer.subscribe<TodoEntity>(
					{ groupId: "todos-processor1" },
					{ topics: ["todos-v1"], fromBeginning: true },
					(msg) => {
						console.log("Received Msg: ", msg);
					},
				);
				return queue;
			},
		},
	],
})
export class TodosModule {}
