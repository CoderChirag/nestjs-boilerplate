import { TodoEntity } from "src/utility/entities/todos/todo.entity";

export interface ITodoService {
	getConnectionStatus(): Promise<boolean>;
	findAll(): Promise<TodoEntity[]>;
}
