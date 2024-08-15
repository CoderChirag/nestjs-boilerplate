import { Inject, Injectable } from "@nestjs/common";
import { KafkaConsumerService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

@Injectable()
export class TodosService {
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;
	private kafkaConsumerService: KafkaConsumerService;

	constructor(
		private readonly todoRepository: TodoRepository,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) _queueService: KafkaService,
	) {
		this.dbService = todoRepository.getSqlService();
		this.kafkaProducerService = _queueService.producer;
		this.kafkaConsumerService = _queueService.consumer;
	}

	async getAll() {
		await this.kafkaConsumerService.subscribe<TodoEntity>(
			{ groupId: "todos-v1-processor" },
			{ topics: ["todos-v1"] },
			async (message) => {
				const { key, value, headers } = message;
				console.log("Received Message Key:", key);
				console.log("Received Message Value:", value);
				console.log("Received Message Headers:", headers);
			},
		);
		const todos = await this.dbService.findAll();
		await this.kafkaProducerService.publish("todos-v1", { key: "todos", value: todos[0] });
		return todos;
	}
}
