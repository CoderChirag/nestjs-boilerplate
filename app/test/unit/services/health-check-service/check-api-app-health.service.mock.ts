import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { CheckApiAppHealthService } from "src/services/health-check-service/check-api-app-health.service";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const metadata = moduleMocker.getMetadata(CheckApiAppHealthService) as MockFunctionMetadata<
	ClassType<WithMock<CheckApiAppHealthService>>,
	"function"
>;
const Mock = moduleMocker.generateFromMetadata(metadata);
export const MockCheckApiAppHealthService = new Mock();
