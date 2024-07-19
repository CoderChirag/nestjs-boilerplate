import { Injectable } from "@nestjs/common";
import { Model, connect, createConnection } from "mongoose";
import { Sequelize } from "sequelize";
import { DB_TYPES } from "src/utility/db-utility/constants";
import { DBService } from "src/utility/db-utility/db.service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { SCHEMAS } from "src/utility/models/mongo";
import { TodoSchema } from "src/utility/models/mongo/todos/todo.schema";
import { MODELS } from "src/utility/models/sql";
import { Todo, TodoModel } from "src/utility/models/sql/todos/todo.model";
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
		const config = {
			type: DB_TYPES.MONGO_DB as DB_TYPES.MONGO_DB,
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
		const a = await db.todo.findById("6697e3a1f5b9a1ea2793c5f6");
		return a;
	}

	async getHello3() {
		try {
			const db = new Sequelize("mysql://127.0.0.1:3306", {
				dialect: "mysql",
				username: "root",
				password: "password123",
				database: "todos",
				logging: console.log,
			});
			TodoModel(db);
			await db.sync();
			await Todo.create({
				description: "Do something serious",
				priority: 1,
				status: TodoStatus.DOING,
				title: "sd",
			});

			const a = await Todo.findByPk(1);
			return a;
		} catch (err) {
			console.log(err);
		}
	}

	async getHello4() {
		const config = {
			type: DB_TYPES.SQL as DB_TYPES.SQL,
			connectionString: "mysql://127.0.0.1:3306",
			models: MODELS.todos,
			dialectOptions: {
				username: "root",
				password: "password123",
				database: "todos",
				logging: console.log,
			},
		};
		const db = new DBService(config).getDbInstance();
		await db.connect();
		await db.todo.create({
			description: "Do something serious",
			priority: 1,
			status: TodoStatus.DOING,
			title: "sd",
		});
		const a = await db.todo.findByPk(3);
		console.log(await db.isConnected());
		return a;
	}
}
