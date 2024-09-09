import { MockTodoMongoService } from "./todo-mongo.service";
import { MockTodoSqlService } from "./todo-sql.service";

export const MockTodoRepository = {
	getMongoService: () => MockTodoMongoService,
	getSqlService: () => MockTodoSqlService,
	getConnectionStatus: jest.fn(),
};
