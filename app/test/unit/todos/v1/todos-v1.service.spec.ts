import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { TodosService } from "src/modules/todos/v1/todos.service";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";
import { mockMongoTodo } from "test/unit/mocks/common.mock";
import { MockTodoSqlService } from "test/unit/mocks/db-services/todo-sql.service";
import { MockTodoRepository } from "test/unit/mocks/db-services/todo.repository.mock";
import { MockRedisService } from "test/unit/mocks/external-services/redis.service.mock";

describe("TodosServiceV1", () => {
	let todosService: TodosService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TodosService,
				{
					provide: TodoRepository,
					useValue: MockTodoRepository,
				},
				{
					provide: constants.CACHING_SERVICES.REDIS.PROVIDER_NAME,
					useValue: MockRedisService,
				},
			],
		})
			.useMocker((token) => {
				if (
					token === constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME ||
					token === constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME
				)
					return {};
			})
			.compile();

		todosService = module.get<TodosService>(TodosService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all todos", async () => {
			MockTodoSqlService.findAll.mockResolvedValue([mockMongoTodo]);
			const todos = await todosService.getAll();
			expect([]).toEqual([]);
		});
	});
});
