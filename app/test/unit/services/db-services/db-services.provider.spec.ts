import { Test } from "@nestjs/testing";
import { DBServicesProvider } from "src/services/db-services/db-services.provider";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";
import { MockTodoRepository } from "test/unit/mocks/db-services/todo.repository.mock";

describe("DBServicesProvider", () => {
	let dbServicesProvider: DBServicesProvider;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				DBServicesProvider,
				{
					provide: TodoRepository,
					useValue: MockTodoRepository,
				},
			],
		}).compile();

		dbServicesProvider = module.get<DBServicesProvider>(DBServicesProvider);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getConnectionStatus", () => {
		it("should provide db connection status", async () => {
			MockTodoRepository.getConnectionStatus.mockResolvedValue(true);
			const result = await dbServicesProvider.getConnectionStatus();
			expect(result).toBe(true);
		});
	});
});
