import { Inject, Injectable, Logger } from "@nestjs/common";
import { ASBProducerService, ASBService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosServiceV2 {
	private logger = new Logger("TodosService");
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;
	private asbProducerService: ASBProducerService;

	constructor(
		private readonly todoRepository: TodoRepository,
		@Inject(constants.CACHING_SERVICES.REDIS.PROVIDER_NAME) private readonly redis: any,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME) _kafkaService: KafkaService,
		@Inject(constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME) _asbService: ASBService,
	) {
		this.kafkaProducerService = _kafkaService.producer;
		this.asbProducerService = _asbService.producer;
		this.dbService = todoRepository.getMongoService();
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		const res = await this.redis.set("todos-v2", JSON.stringify(todos[0]));
		this.logger.log(`Todos-v2 Cached: ${res}`);
		this.logger.log(await this.redis.get("todos-v2"));
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
