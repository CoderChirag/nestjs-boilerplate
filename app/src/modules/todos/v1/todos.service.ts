import { Inject, Injectable } from "@nestjs/common";
import { KafkaService } from "queue-service";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosService {
	private dbService: ITodoService;
	constructor(
		private readonly todoRepository: TodoRepository,
		@Inject("QUEUE_SERVICE") private readonly queueService: KafkaService,
	) {
		this.dbService = todoRepository.getSqlService();
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		await this.queueService.producer.publish("todos-v1", { key: "todos", value: todos[0] });
		return todos;
	}
}
