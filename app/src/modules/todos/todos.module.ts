import { Module } from "@nestjs/common";
import { DBServicesModule } from "src/services/db-services/db-services.module";
import { TodosController } from "./v1/todos.controller";
import { TodosService } from "./v1/todos.service";
import { TodosControllerV2 } from "./v2/todos.controller";
import { TodosServiceV2 } from "./v2/todos.service";

@Module({
	imports: [DBServicesModule],
	controllers: [TodosController, TodosControllerV2],
	providers: [TodosService, TodosServiceV2],
})
export class TodosModule {}
