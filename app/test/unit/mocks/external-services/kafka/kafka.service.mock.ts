import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { KafkaService } from "queue-service";
import { WithMock } from "test/unit/types";
import { MockKafkaProducerService } from "./kafka-producer.service.mock";
import { MockKafkaConsumerService } from "./kafka-consumer.service.mock";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(KafkaService) as MockFunctionMetadata<
	ClassType<WithMock<KafkaService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockKafkaService = new Mock();
(MockKafkaService.producer as any) = MockKafkaProducerService;
(MockKafkaService.consumer as any) = MockKafkaConsumerService;
