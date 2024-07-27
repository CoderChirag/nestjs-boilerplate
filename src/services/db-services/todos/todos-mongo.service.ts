import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants";
import { IMongoService } from "src/utility/db-utility/types";
import { SCHEMAS } from "src/utility/models/mongo";
import { ITodosService } from "../interfaces/todos.interface";
import { Todo } from "src/utility/models/mongo/todos/todo.schema";

@Injectable()
export class TodosMongoService implements ITodosService {
	constructor(
		@Inject(constants.DB_SERVICES.MONGO_DB_SERVICE)
		private readonly mongoService: IMongoService<typeof SCHEMAS.todos>,
	) {}

	async findAllTodos(): Promise<Todo[]> {
		const todos = await this.mongoService.todo.find();
		return todos;
	}
}
