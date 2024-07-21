import { Schema } from "mongoose";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { TodoStatus } from "src/utility/types/todos/todo.enum";

export const TodoSchema = new Schema<TodoEntity>({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	priority: {
		type: Number,
		required: true,
		default: 0,
	},
	status: {
		type: String,
		required: true,
		enum: TodoStatus,
		default: TodoStatus.TO_DO,
	},
});
