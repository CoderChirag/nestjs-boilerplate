import { Inject, Injectable } from "@nestjs/common";
import { ASBProducerService, ASBService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosService {
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;
	private asbProducerService: ASBProducerService;

	constructor(
		_todoRepository: TodoRepository,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) _kafkaService: KafkaService,
		@Inject(constants.QUEUE_SERVICES.ASB_SERVICE) _asbService: ASBService,
	) {
		this.dbService = _todoRepository.getSqlService();
		this.kafkaProducerService = _kafkaService.producer;
		this.asbProducerService = _asbService.producer;
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		todos[0].createdAt = todos[0]?.createdAt?.toString() ?? "";
		todos[0].updatedAt = todos[0]?.updatedAt?.toString() ?? "";
		await this.kafkaProducerService.publish(
			constants.INFRA.PUBLISH_TOPICS.TODOS_SQL,
			{
				key: "todos",
				value: todos[0],
			},
			true,
		);
		await this.asbProducerService.publish(constants.INFRA.PUBLISH_ASB_QUEUES.TODOS_SQL, {
			subject: "todos-v1",
			body: todos[0],
		});
		return todos;
	}
}
