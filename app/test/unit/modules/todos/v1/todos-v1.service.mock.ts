import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodosService } from "src/modules/todos/v1/todos.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(TodosService) as MockFunctionMetadata<
	ClassType<WithMock<TodosService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockTodosService = new Mock();
