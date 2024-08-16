import { IsBoolean, IsEnum, IsNumber, IsPort, IsString } from "class-validator";

export function processorAppEnvTransformer(env: Object) {
	const transformedEnv = { ...env };
	if (env["APM_ACTIVE"]) transformedEnv["APM_ACTIVE"] = Boolean(env["APM_ACTIVE"]);
	if (env["LIVENESS_WRITE_INTERVAL"])
		transformedEnv["LIVENESS_WRITE_INTERVAL"] = Number(env["LIVENESS_WRITE_INTERVAL"]);
	return transformedEnv;
}

export class ProcessorAppEnvSchema {
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

	@IsNumber()
	LIVENESS_WRITE_INTERVAL: number;

	@IsString()
	TODOS_PROCESSOR_GROUP_ID: string;
	@IsString()
	TODOS_PROCESSOR_TOPICS: string;
}
