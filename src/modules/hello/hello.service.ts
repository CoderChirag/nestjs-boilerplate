import { Injectable } from "@nestjs/common";
import { Model, connect, createConnection } from "mongoose";
import { DB_TYPES } from "src/utility/db-utility/constants";
import { DBConfigOptions, DBService } from "src/utility/db-utility/db.service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { SCHEMAS } from "src/utility/schemas";
import { TodoSchema } from "src/utility/schemas/todos/todo.schema";
import { TodoStatus } from "src/utility/types/todos/todo.enum";

@Injectable()
export class HelloService {
	async getHello() {
		const conn = await createConnection("mongodb://localhost:27017/test");
		const Todo = conn.model("todo", TodoSchema);

		const _repository: Model<TodoEntity> = Todo;

		const todo = new Todo({
			description: "Do something",
			priority: "1",
			status: TodoStatus.DOING,
			title: "sd",
		});
		await todo.save();
		const to = await Todo.findById("6697e3a1f5b9a1ea2793c5f6");
		return to?.get("");
	}

	async getHello2() {
		const config: DBConfigOptions<DB_TYPES.MONGO_DB, typeof SCHEMAS.todos> = {
			type: DB_TYPES.MONGO_DB,
			connectionString: "mongodb://localhost:27017/test",
			schemas: SCHEMAS.todos,
		};
		const db = new DBService(config).getDbInstance();
		await db.connect();
		await db.todo.create({
			description: "Do something serious",
			priority: "1",
			status: TodoStatus.DOING,
			title: "sd",
		});
		const a = await db.models.todo.findById("6697e3a1f5b9a1ea2793c5f6");
		return a;
	}
}
