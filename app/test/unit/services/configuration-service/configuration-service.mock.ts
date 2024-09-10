import { IsEnum, IsPort, IsString } from "class-validator";

export class MockConfigurationSchema {
	@IsEnum(["local", "test", "development", "uat", "production"])
	NODE_ENV: "local" | "test" | "development" | "uat" | "production";
	@IsPort()
	PORT: string;
	@IsString()
	APP_NAME: string;
}

export const mockEnv = {
	NODE_ENV: "test",
	PORT: "3000",
	APP_NAME: "test",
};

export const mockNegativeEnv = {
	NODE_ENV: "test",
	PORT: "3000",
	APP_NAME: 1,
};
