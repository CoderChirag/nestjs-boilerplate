import { Inject, Injectable } from "@nestjs/common";
import { todo } from "node:test";
import { ASBProducerService, ASBService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosServiceV2 {
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;
	private asbProducerService: ASBProducerService;

	constructor(
		private readonly todoRepository: TodoRepository,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) _kafkaService: KafkaService,
		@Inject(constants.QUEUE_SERVICES.ASB_SERVICE) _asbService: ASBService,
	) {
		this.kafkaProducerService = _kafkaService.producer;
		this.asbProducerService = _asbService.producer;
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

		await this.asbProducerService.publish(constants.INFRA.ASB_QUEUES.TODOS_MONGO, {
			subject: "todos-v2",
			body: todos[0],
		});
		return todos;
	}
}
