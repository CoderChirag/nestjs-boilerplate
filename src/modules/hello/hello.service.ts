import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants/constants";
import { MongoDbService, SqlDbService } from "src/utility/db-utility/types";
import { SCHEMAS } from "src/utility/models/mongo";
import { MODELS } from "src/utility/models/sql";
import { TodoStatus } from "src/utility/types/todos/todo.enum";

@Injectable()
export class HelloService {
	constructor(
		@Inject(constants.DB_SERVICES.TODOS_MONGO_DB_SERVICE)
		private readonly todosMongoService: MongoDbService<typeof SCHEMAS.todos>,
		@Inject(constants.DB_SERVICES.TODOS_SQL_DB_SERVICE)
		private readonly todosSqlService: SqlDbService<typeof MODELS.todos>,
	) {}

	async getHello22() {
		await this.todosMongoService.todo.create({
			description: "Do something serious",
			priority: "1",
			status: TodoStatus.DOING,
			title: "sd",
		});
		const a = await this.todosMongoService.todo.findById("6697e3a1f5b9a1ea2793c5f6");
		return a;
	}

	async getHello44() {
		await this.todosSqlService.todo.create({
			description: "Do something serious",
			priority: 1,
			status: TodoStatus.DOING,
			title: "sd",
		});
		const a = await this.todosSqlService.todo.findByPk(3);
		console.log(await this.todosSqlService.isConnected());
		return a;
	}
}
