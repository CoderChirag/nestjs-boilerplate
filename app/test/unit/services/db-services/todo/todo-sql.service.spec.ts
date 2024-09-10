import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { TodoSqlService } from "src/services/db-services/todo/todo-sql.service";
import { mockSqlTodo } from "test/unit/mocks/common.mock";
import {
	mockSqlModel,
	MockSqlService,
} from "test/unit/mocks/external-services/sql/sql.service.mock";

describe("TodoSqlService", () => {
	let todoSqlService: TodoSqlService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TodoSqlService,
				{
					provide: constants.DB_SERVICES.SQL_DB_SERVICE.PROVIDER_NAME,
					useValue: MockSqlService,
				},
			],
		}).compile();

		todoSqlService = module.get<TodoSqlService>(TodoSqlService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getConnectionStatus", () => {
		it("should return db connection status", async () => {
			MockSqlService.isConnected.mockResolvedValue(true);
			const result = await todoSqlService.getConnectionStatus();
			expect(result).toBe(true);
		});
	});

	describe("findAll", () => {
		it("should return all todos", async () => {
			mockSqlModel.toJSON.mockReturnValue(mockSqlTodo);
			MockSqlService.todo.findAll.mockResolvedValue([mockSqlModel]);
			const todos = await todoSqlService.findAll();
			expect(todos).toMatchObject([mockSqlTodo]);
		});
	});
});
