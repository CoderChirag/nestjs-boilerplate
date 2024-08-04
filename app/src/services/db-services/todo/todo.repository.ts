import { Injectable } from "@nestjs/common";
import { TodoMongoService } from "./todo-mongo.service";
import { TodoSqlService } from "./todo-sql.service";

@Injectable()
export class TodoRepository {
	constructor(
		private readonly mongoService: TodoMongoService,
		private readonly sqlService: TodoSqlService,
	) {}

	getMongoService() {
		return this.mongoService;
	}

	getSqlService() {
		return this.sqlService;
	}

	async getConnectionStatus() {
		const results = await Promise.all([
			this.mongoService.getConnectionStatus(),
			this.sqlService.getConnectionStatus(),
		]);
		return !results.includes(false);
	}
}
