import { Type as ClassType } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HealthCheckService } from "@nestjs/terminus";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(EventEmitter2) as MockFunctionMetadata<
	ClassType<WithMock<EventEmitter2>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockEventEmitterService = new Mock();
