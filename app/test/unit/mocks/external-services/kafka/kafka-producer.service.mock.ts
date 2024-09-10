import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { KafkaProducerService } from "queue-service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(KafkaProducerService) as MockFunctionMetadata<
	ClassType<WithMock<KafkaProducerService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockKafkaProducerService = new Mock();
