import { Test } from "@nestjs/testing";
import { mockMongoTodo } from "test/unit/mocks/common.mock";
import { MockTodosServiceV2 } from "./todos-v2.service.mock";
import { TodosControllerV2 } from "src/modules/todos/v2/todos.controller";
import { TodosServiceV2 } from "src/modules/todos/v2/todos.service";

describe("TodosControllerV2", () => {
	let todosController: TodosControllerV2;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [TodosControllerV2],
			providers: [
				{
					provide: TodosServiceV2,
					useValue: MockTodosServiceV2,
				},
			],
		}).compile();

		todosController = module.get<TodosControllerV2>(TodosControllerV2);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all todos", async () => {
			MockTodosServiceV2.getAll.mockResolvedValue([mockMongoTodo]);
			const todos = await todosController.getAll();
			expect(todos).toEqual([mockMongoTodo]);
		});
	});
});
