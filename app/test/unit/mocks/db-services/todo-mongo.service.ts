import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodoMongoService } from "src/services/db-services/todo/todo-mongo.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(TodoMongoService) as MockFunctionMetadata<
	ClassType<WithMock<TodoMongoService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockTodoMongoService = new Mock();
