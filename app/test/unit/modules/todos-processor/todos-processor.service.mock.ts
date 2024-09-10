import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodosProcessorService } from "src/modules/todos-processor/todos-processor.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(TodosProcessorService) as MockFunctionMetadata<
	ClassType<WithMock<TodosProcessorService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockTodosProcessorService = new Mock();
