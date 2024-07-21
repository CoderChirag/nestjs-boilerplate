import { TodoEntity } from "src/utility/entities/todos/todo.entity";

export interface ITodosService {
	findAllTodos(): Promise<TodoEntity[]>;
}
