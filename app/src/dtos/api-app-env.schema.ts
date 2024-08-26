import { IsBoolean, IsEnum, IsPort, IsString } from "class-validator";

export function apiAppEnvTransformer(env: object) {
	const transformedEnv = { ...env };
	if (env["APM_ACTIVE"]) transformedEnv["APM_ACTIVE"] = Boolean(env["APM_ACTIVE"]);
	return transformedEnv;
}

export class ApiAppEnvSchema {
	@IsEnum(["local", "development", "uat", "production"])
	NODE_ENV: "local" | "development" | "uat" | "production";
	@IsPort()
	PORT: string;
	@IsString()
	APP_NAME: string;

	@IsBoolean()
	APM_ACTIVE: boolean;
	@IsString()
	APM_SERVICE_NAME: string;
	@IsString()
	APM_SERVER_URL: string;

	@IsString()
	MONGO_CONNECTION_STRING: string;

	@IsString()
	SQL_CONNECTION_STRING: string;
	@IsString()
	SQL_USERNAME: string;
	@IsString()
	SQL_PASSWORD: string;
	@IsString()
	SQL_DATABASE: string;

	@IsString()
	KAFKA_CLIENT_ID: string;
	@IsString()
	KAFKA_BROKERS: string;

	@IsString()
	SCHEMA_REGISTRY_HOST: string;

	@IsString()
	ASB_CONNECTION_STRING: string;
}
