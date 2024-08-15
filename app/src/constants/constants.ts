export const constants = {
	INFRA: {
		APP_NAMES: {
			API_APP: "api-app",
		},
		HEALTH_CHECKS: {
			SHUTDOWN_CHECK: "shutDownCheck",
			DB_SERVICES_STATUS_CHECK: "dbServicesStatusCheck",
		},
		SHUTDOWN_EVENT: "SHUTDOWN_EVENT",
	},
	SWAGGER: {
		TITLE: "Nestjs Boilerplate",
		DESCRIPTION: "A boilerplate for creating a nestjs project",
		VERSION: "1.0",
		DOCUMENTATION_PATH: "/api/docs",
		JSON_DOCUMENTATION_PATH: "/api/docs-json",
	},
	DB_SERVICES: {
		MONGO_DB_SERVICE: "MONGO_DB_SERVICE",
		SQL_DB_SERVICE: "SQL_DB_SERVICE",
	},
	QUEUE_SERVICES: {
		KAFKA_SERVICE: "KAFKA_SERVICE",
	},
};
