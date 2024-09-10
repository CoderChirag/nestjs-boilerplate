import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodoSqlService } from "src/services/db-services/todo/todo-sql.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(TodoSqlService) as MockFunctionMetadata<
	ClassType<WithMock<TodoSqlService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockTodoSqlService = new Mock();
