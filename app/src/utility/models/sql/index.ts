import { TodoModel } from "./todos/todo.model";

export const MODELS = {
	todos: {
		todo: TodoModel,
	},
} as const;
