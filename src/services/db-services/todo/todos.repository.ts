import { Injectable } from "@nestjs/common";
import { TodoMongoService } from "./todos-mongo.service";
import { TodoSqlService } from "./todos-sql.service";

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
}
