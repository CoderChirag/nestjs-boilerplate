import { Inject, Injectable } from "@nestjs/common";
import { todo } from "node:test";
import { KafkaProducerService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosServiceV2 {
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;

	constructor(
		private readonly todoRepository: TodoRepository,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) _kafkaService,
	) {
		this.kafkaProducerService = _kafkaService.producer;
		this.dbService = todoRepository.getMongoService();
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		await this.kafkaProducerService.publish(
			constants.INFRA.PUBLISH_TOPICS.TODOS_MONGO,
			{
				key: "todos-v2",
				value: todos[0],
			},
			true,
		);
		return todos;
	}
}
