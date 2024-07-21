import { Module } from "@nestjs/common";
import { TodosMongoService } from "./todos/todos-mongo.service";
import { TodosSqlService } from "./todos/todos-sql.service";

@Module({
	providers: [TodosMongoService, TodosSqlService],
	exports: [TodosMongoService, TodosSqlService],
})
export class DBServicesModule {}
