import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { ASBProducerService } from "queue-service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(ASBProducerService) as MockFunctionMetadata<
	ClassType<WithMock<ASBProducerService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockASBProducerService = new Mock();
