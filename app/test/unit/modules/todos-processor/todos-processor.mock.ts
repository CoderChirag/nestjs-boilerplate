import { IASBMessageProcessorMessageArg, IKafkaMessageProcessorMessageArg } from "queue-service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { mockSqlTodo } from "test/unit/mocks/common.mock";

export const MockKafkaTodoEntity: IKafkaMessageProcessorMessageArg<TodoEntity> = {
	key: "todos",
	value: mockSqlTodo,
	headers: {},
};

export const MockASBTodoEntity: Pick<
	IASBMessageProcessorMessageArg<TodoEntity>,
	"body" | "applicationProperties"
> = {
	body: mockSqlTodo,
	applicationProperties: {},
};
