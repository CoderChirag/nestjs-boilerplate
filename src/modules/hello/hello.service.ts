import { Injectable } from "@nestjs/common";
import { TodosMongoService } from "src/services/db-services/todos/todos-mongo.service";
import { TodosSqlService } from "src/services/db-services/todos/todos-sql.service";

@Injectable()
export class HelloService {
	constructor(
		private readonly todosMongoService: TodosMongoService,
		private readonly todosSqlService: TodosSqlService,
	) {}

	async getTodosFromMongo() {
		return await this.todosMongoService.findAllTodos();
	}

	async getTodosFromSql() {
		return await this.todosSqlService.findAllTodos();
	}
}
