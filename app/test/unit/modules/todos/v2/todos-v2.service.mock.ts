import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodosServiceV2 } from "src/modules/todos/v2/todos.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(TodosServiceV2) as MockFunctionMetadata<
	ClassType<WithMock<TodosServiceV2>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockTodosServiceV2 = new Mock();
