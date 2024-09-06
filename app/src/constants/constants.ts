export const constants = {
	INFRA: {
		APP_NAMES: {
			API_APP: "api-app",
			CONSUMER_APP: "consumer-app",
		},
		HEALTH_CHECKS: {
			SHUTDOWN_CHECK: "shutDownCheck",
			DB_SERVICES_STATUS_CHECK: "dbServicesStatusCheck",
		},
		SHUTDOWN_EVENT: "SHUTDOWN_EVENT",
		LIVENESS: {
			FILE_PATH: "liveness/liveness.txt",
		},
		PUBLISH_TOPICS: {
			TODOS_SQL: `todos-v1-${process.env.NODE_ENV}`,
			TODOS_MONGO: `todos-v2-${process.env.NODE_ENV}`,
		},
		ASB_QUEUES: {
			TODOS_SQL: `todos-v1-${process.env.NODE_ENV}`,
			TODOS_MONGO: `todos-v2-${process.env.NODE_ENV}`,
		},
		CONSUMER_GROUPS: {
			TODOS_SQL: {
				GROUP_ID: `todos-v1-processor-${process.env.NODE_ENV}`,
				TOPICS: [`todos-v1-${process.env.NODE_ENV}`],
			},
			TODOS_MONGO: {
				GROUP_ID: `todos-v2-processor-${process.env.NODE_ENV}`,
				TOPICS: [`todos-v2-${process.env.NODE_ENV}`],
			},
		},
		CACHING_SERVICES: {
			REDIS: {
				PROVIDER_NAME: "REDIS_SERVICE",
			},
		},
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
		ASB_SERVICE: "ASB_SERVICE",
	},
	CONFIGURATION_SERVICE: "ConfigurationService",
};
