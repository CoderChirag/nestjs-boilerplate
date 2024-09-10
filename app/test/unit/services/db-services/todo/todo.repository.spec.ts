import { Test } from "@nestjs/testing";
import { TodoMongoService } from "src/services/db-services/todo/todo-mongo.service";
import { TodoSqlService } from "src/services/db-services/todo/todo-sql.service";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";
import { MockTodoMongoService } from "test/unit/mocks/db-services/todo-mongo.service";
import { MockTodoSqlService } from "test/unit/mocks/db-services/todo-sql.service";

describe("TodoRepository", () => {
	let todoRepository: TodoRepository;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TodoRepository,
				{
					provide: TodoMongoService,
					useValue: MockTodoMongoService,
				},
				{
					provide: TodoSqlService,
					useValue: MockTodoSqlService,
				},
			],
		}).compile();

		todoRepository = module.get<TodoRepository>(TodoRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getMongoService", () => {
		it("should return mongo service", () => {
			const result = todoRepository.getMongoService();
			expect(result).toBe(MockTodoMongoService);
		});
	});

	describe("getSqlService", () => {
		it("should return sql service", () => {
			const result = todoRepository.getSqlService();
			expect(result).toBe(MockTodoSqlService);
		});

		describe("getConnectionStatus", () => {
			it("should provide db connection status", async () => {
				MockTodoMongoService.getConnectionStatus.mockResolvedValue(true);
				MockTodoSqlService.getConnectionStatus.mockResolvedValue(true);
				const result = await todoRepository.getConnectionStatus();
				expect(result).toBe(true);
			});
		});
	});
});
