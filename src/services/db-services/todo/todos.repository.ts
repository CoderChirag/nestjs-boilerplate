import { Injectable } from "@nestjs/common";
import { TodoMongoService } from "./todos-mongo.service";
import { TodoSqlService } from "./todos-sql.service";
import { getMongoService } from "src/utility/db-utility/mongo/mongo.service";

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
