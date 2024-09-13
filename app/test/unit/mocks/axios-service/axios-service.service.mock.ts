import { CreateAxiosDefaults } from "axios";
import { ModuleMocker } from "jest-mock";
import { AxiosService } from "src/services/axios-service/axios.service";
import { MockPinoLoggerService } from "../common.mock";
import { Logger } from "nestjs-pino";
import { MockAxiosInstance } from "test/unit/services/axios-service/axios.mock";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const mockAxiosServiceConfig: CreateAxiosDefaults = {
	baseURL: "http://localhost:3000",
};

const axiosServiceMetadata = moduleMocker.getMetadata(AxiosService)!;

const MockAxiosServiceClass = moduleMocker.generateFromMetadata(axiosServiceMetadata);
export const MockAxiosService = new MockAxiosServiceClass(
	mockAxiosServiceConfig,
	MockPinoLoggerService as unknown as Logger,
) as unknown as WithMock<AxiosService> & { axios: typeof MockAxiosInstance };
(MockAxiosService.axios as any) = MockAxiosInstance;
