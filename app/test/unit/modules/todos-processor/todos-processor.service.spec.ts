import { Test } from "@nestjs/testing";
import { TodosProcessorService } from "src/modules/todos-processor/todos-processor.service";
import { MockASBTodoEntity, MockKafkaTodoEntity } from "./todos-processor.mock";
import { Logger } from "@nestjs/common";
import { IASBMessageProcessorMessageArg } from "queue-service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { MockPinoLoggerService } from "test/unit/mocks/common.mock";

describe("TodosProcessorService", () => {
	let todosProcessorService: TodosProcessorService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [TodosProcessorService],
		}).compile();

		todosProcessorService = module.get<TodosProcessorService>(TodosProcessorService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("processTodos", () => {
		it("should process the published todos", async () => {
			const result = await todosProcessorService.processTodos(
				MockKafkaTodoEntity,
				MockPinoLoggerService as unknown as Logger,
			);
			expect(result).toBe(undefined);
		});
	});

	describe("processTodosFromASB", () => {
		it("should process the published todos", async () => {
			const result = await todosProcessorService.processTodosFromASB(
				MockASBTodoEntity as unknown as IASBMessageProcessorMessageArg<TodoEntity>,
				MockPinoLoggerService as unknown as Logger,
			);
			expect(result).toBe(undefined);
		});
	});
});
