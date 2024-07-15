import { TodoStatus } from "src/utility/types/todos/todo.enum";

export class TodoEntity {
	_id: number;
	title: string;
	description: string;
	priority: number;
	status: TodoStatus;
}
