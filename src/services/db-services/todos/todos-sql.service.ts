import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants";
import { ISqlService } from "src/utility/db-utility/types";
import { MODELS } from "src/utility/models/sql";
import { ITodosService } from "../interfaces/todos.interface";
import { Todo } from "src/utility/models/sql/todos/todo.model";

@Injectable()
export class TodosSqlService implements ITodosService {
	constructor(
		@Inject(constants.DB_SERVICES.SQL_DB_SERVICE)
		private readonly sqlService: ISqlService<typeof MODELS.todos>,
	) {}

	async findAllTodos(): Promise<Todo[]> {
		return await this.sqlService.todo.findAll();
	}
}
