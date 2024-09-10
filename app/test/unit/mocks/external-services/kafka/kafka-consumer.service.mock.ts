import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { KafkaConsumerService } from "queue-service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(KafkaConsumerService) as MockFunctionMetadata<
	ClassType<WithMock<KafkaConsumerService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockKafkaConsumerService = new Mock();
