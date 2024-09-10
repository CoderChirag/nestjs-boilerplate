import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { TodosServiceV2 } from "src/modules/todos/v2/todos.service";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";
import { mockMongoTodo } from "test/unit/mocks/common.mock";
import { MockTodoRepository } from "test/unit/mocks/db-services/todo.repository.mock";
import { MockASBService } from "test/unit/mocks/external-services/asb/asb.service.mock";
import { MockKafkaService } from "test/unit/mocks/external-services/kafka/kafka.service.mock";
import { MockRedisService } from "test/unit/mocks/external-services/redis/redis.service.mock";

describe("TodosServiceV2", () => {
	let todosService: TodosServiceV2;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TodosServiceV2,
				{
					provide: TodoRepository,
					useValue: MockTodoRepository,
				},
				{
					provide: constants.CACHING_SERVICES.REDIS.PROVIDER_NAME,
					useValue: MockRedisService,
				},
				{
					provide: constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME,
					useValue: MockKafkaService,
				},
				{
					provide: constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME,
					useValue: MockASBService,
				},
			],
		}).compile();

		todosService = module.get<TodosServiceV2>(TodosServiceV2);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all todos", async () => {
			MockTodoRepository.getMongoService().findAll.mockResolvedValue([mockMongoTodo]);
			const todos = await todosService.getAll();
			expect(todos).toEqual([mockMongoTodo]);
		});
	});
});
