import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { TodoMongoService } from "src/services/db-services/todo/todo-mongo.service";
import { mockMongoTodo } from "test/unit/mocks/common.mock";
import {
	mockMongoModel,
	MockMongoService,
} from "test/unit/mocks/external-services/mongo/mongo.service.mock";

describe("TodoMongoService", () => {
	let todoMongoService: TodoMongoService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				TodoMongoService,
				{
					provide: constants.DB_SERVICES.MONGO_DB_SERVICE.PROVIDER_NAME,
					useValue: MockMongoService,
				},
			],
		}).compile();

		todoMongoService = module.get<TodoMongoService>(TodoMongoService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getConnectionStatus", () => {
		it("should return db connection status", async () => {
			MockMongoService.isConnected.mockResolvedValue(true);
			const result = await todoMongoService.getConnectionStatus();
			expect(result).toBe(true);
		});
	});

	describe("findAll", () => {
		it("should return all todos", async () => {
			mockMongoModel.toJSON.mockReturnValue(mockMongoTodo);
			MockMongoService.todo.find.mockResolvedValue([{ ...mockMongoModel, ...mockMongoTodo }]);
			const todos = await todoMongoService.findAll();
			expect(todos).toMatchObject([mockMongoTodo]);
		});
	});
});
