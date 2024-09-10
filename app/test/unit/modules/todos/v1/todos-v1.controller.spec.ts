import { Test } from "@nestjs/testing";
import { TodosController } from "src/modules/todos/v1/todos.controller";
import { TodosService } from "src/modules/todos/v1/todos.service";
import { mockSqlTodo } from "test/unit/mocks/common.mock";
import { MockTodosService } from "./todos-v1.service.mock";

describe("TodosControllerV1", () => {
	let todosController: TodosController;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [TodosController],
			providers: [
				{
					provide: TodosService,
					useValue: MockTodosService,
				},
			],
		}).compile();

		todosController = module.get<TodosController>(TodosController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all todos", async () => {
			MockTodosService.getAll.mockResolvedValue([mockSqlTodo]);
			const todos = await todosController.getAll();
			expect(todos).toEqual([mockSqlTodo]);
		});
	});
});
