import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants";
import { IMongoService } from "src/utility/db-utility/types";
import { SCHEMAS } from "src/utility/models/mongo";
import { ITodoService } from "./todo.interface";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

@Injectable()
export class TodoMongoService implements ITodoService {
	constructor(
		@Inject(constants.DB_SERVICES.MONGO_DB_SERVICE)
		private readonly mongoService: IMongoService<typeof SCHEMAS.todos>,
	) {}

	async findAll() {
		const todos = await this.mongoService.todo.find();
		return todos.map((todo) => {
			return { ...todo.toJSON(), _id: todo._id.toString() } as TodoEntity;
		});
	}
}
