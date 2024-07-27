import { Todo } from "src/utility/models/mongo/todos/todo.schema";

export interface ITodosService {
	findAllTodos(): Promise<any>;
}
