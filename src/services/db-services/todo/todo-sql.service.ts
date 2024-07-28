import { Inject, Injectable } from "@nestjs/common";
import { constants } from "src/constants";
import { ISqlService } from "src/utility/db-utility";
import { MODELS } from "src/utility/models/sql";
import { ITodoService } from "./todo.interface";

@Injectable()
export class TodoSqlService implements ITodoService {
	constructor(
		@Inject(constants.DB_SERVICES.SQL_DB_SERVICE)
		private readonly sqlService: ISqlService<typeof MODELS.todos>,
	) {}

	async getConnectionStatus() {
		return await this.sqlService.isConnected();
	}

	async findAll() {
		return (await this.sqlService.todo.findAll()).map((todo) => todo.toJSON());
	}
}
