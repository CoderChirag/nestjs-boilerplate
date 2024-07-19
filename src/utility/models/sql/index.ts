import { Model, Sequelize } from "sequelize";
import { Todo, TodoModel } from "./todos/todo.model";

export const MODELS = {
	todos: {
		todo: TodoModel,
	},
};
