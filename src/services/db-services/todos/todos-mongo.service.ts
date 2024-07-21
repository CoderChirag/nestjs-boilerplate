import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants";
import { IMongoService } from "src/utility/db-utility/types";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { SCHEMAS } from "src/utility/models/mongo";
import { ITodosService } from "../interfaces/todos.interface";

@Injectable()
export class TodosMongoService implements ITodosService {
	constructor(
		@Inject(constants.DB_SERVICES.MONGO_DB_SERVICE)
		private readonly mongoService: IMongoService<typeof SCHEMAS.todos>,
	) {}

	async findAllTodos(): Promise<TodoEntity[]> {
		return await this.mongoService.todo.find();
	}
}
