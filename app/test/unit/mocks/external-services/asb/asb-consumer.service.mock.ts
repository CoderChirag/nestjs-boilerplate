import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { ASBConsumerService } from "queue-service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(ASBConsumerService) as MockFunctionMetadata<
	ClassType<WithMock<ASBConsumerService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockASBConsumerService = new Mock();
