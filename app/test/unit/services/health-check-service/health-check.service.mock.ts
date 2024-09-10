import { Type as ClassType } from "@nestjs/common";
import { HealthCheckService } from "@nestjs/terminus";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(HealthCheckService) as MockFunctionMetadata<
	ClassType<WithMock<HealthCheckService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockHealthCheckService = new Mock();
