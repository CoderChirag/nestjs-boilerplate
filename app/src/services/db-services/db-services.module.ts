import { Module } from "@nestjs/common";
import { TodoMongoService } from "./todo/todo-mongo.service";
import { TodoSqlService } from "./todo/todo-sql.service";
import { TodoRepository } from "./todo/todo.repository";
import { DBServicesProvider } from "./db-services.provider";

@Module({
	providers: [DBServicesProvider, TodoMongoService, TodoSqlService, TodoRepository],
	exports: [DBServicesProvider, TodoRepository],
})
export class DBServicesModule {}
