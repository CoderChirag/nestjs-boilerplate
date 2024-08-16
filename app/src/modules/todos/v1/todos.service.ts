import { Inject, Injectable } from "@nestjs/common";
import { KafkaConsumerService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ApiAppEnvSchema } from "src/dtos/api-app-env.schema";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosService {
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;

	constructor(
		@Inject(constants.CONFIGURATION_SERVICE) private readonly configService: ApiAppEnvSchema,
		private readonly todoRepository: TodoRepository,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) _queueService: KafkaService,
	) {
		this.dbService = todoRepository.getSqlService();
		this.kafkaProducerService = _queueService.producer;
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		await this.kafkaProducerService.publish(this.configService.SQL_TODOS_PUBLISH_TOPIC, {
			key: "todos",
			value: todos[0],
		});
		return todos;
	}
}
