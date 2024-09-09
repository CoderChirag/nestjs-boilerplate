import { Inject, Injectable, Logger } from "@nestjs/common";
import { RedisService } from "caching-service";
import { ASBProducerService, ASBService, KafkaProducerService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosService {
	private logger = new Logger("TodosService");
	private dbService: ITodoService;
	private kafkaProducerService: KafkaProducerService;
	private asbProducerService: ASBProducerService;

	constructor(
		_todoRepository: TodoRepository,
		@Inject(constants.CACHING_SERVICES.REDIS.PROVIDER_NAME)
		private readonly redis: RedisService,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME) _kafkaService: KafkaService,
		@Inject(constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME) _asbService: ASBService,
	) {
		this.dbService = _todoRepository.getSqlService();
		this.kafkaProducerService = _kafkaService.producer;
		this.asbProducerService = _asbService.producer;
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		todos[0].createdAt = todos[0]?.createdAt?.toString() ?? "";
		todos[0].updatedAt = todos[0]?.updatedAt?.toString() ?? "";
		const res = await this.redis.set("todos-v1", JSON.stringify(todos[0]));
		this.logger.log(`Todos-v1 Cached: ${res}`);
		this.logger.log(await this.redis.get("todos-v1"));
		await this.kafkaProducerService.publish(
			constants.INFRA.PUBLISH_TOPICS.TODOS_SQL,
			{
				key: "todos",
				value: todos[0],
			},
			true,
		);
		const a = await this.asbProducerService.publish(constants.INFRA.ASB_QUEUES.TODOS_SQL, {
			subject: "todos-v1",
			body: todos[0],
		});
		return todos;
	}
}
