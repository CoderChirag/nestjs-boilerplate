import { create, CreateAxiosDefaults } from "axios";
import { ModuleMocker } from "jest-mock";

const moduleMocker = new ModuleMocker(global);

export const mockAxiosCreateConfig: CreateAxiosDefaults = {
	baseURL: "http://localhost:3000",
};

const axiosMetadata = moduleMocker.getMetadata(create(mockAxiosCreateConfig))!;

export const MockAxiosInstance = moduleMocker.generateFromMetadata(axiosMetadata);
