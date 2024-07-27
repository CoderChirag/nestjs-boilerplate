import { TodoEntity } from "src/utility/entities/todos/todo.entity";

export interface ITodoService {
	findAll(): Promise<TodoEntity[]>;
}
