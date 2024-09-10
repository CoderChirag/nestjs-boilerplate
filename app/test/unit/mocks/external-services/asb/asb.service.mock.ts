import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { ASBService } from "queue-service";
import { WithMock } from "test/unit/types";
import { MockASBProducerService } from "./asb-producer.service.mock";
import { MockASBConsumerService } from "./asb-consumer.service.mock";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(ASBService) as MockFunctionMetadata<
	ClassType<WithMock<ASBService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockASBService = new Mock();
(MockASBService.producer as any) = MockASBProducerService;
(MockASBService.consumer as any) = MockASBConsumerService;
