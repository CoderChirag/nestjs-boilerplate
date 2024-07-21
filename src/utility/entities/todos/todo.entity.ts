import { TodoStatus } from "src/constants";

export class TodoEntity {
	_id: number;
	title: string;
	description: string;
	priority: number;
	status: TodoStatus;
}
