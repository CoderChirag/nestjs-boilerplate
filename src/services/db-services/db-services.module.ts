import { Module } from "@nestjs/common";
import { TodoMongoService } from "./todo/todos-mongo.service";
import { TodoSqlService } from "./todo/todos-sql.service";
import { TodoRepository } from "./todo/todos.repository";

@Module({
	providers: [TodoMongoService, TodoSqlService, TodoRepository],
	exports: [TodoRepository],
})
export class DBServicesModule {}
