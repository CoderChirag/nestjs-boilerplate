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
		KAFKA_DLQ_TOPIC_SUFFIX: ".DLQ",
		PUBLISH_TOPICS: {
			TODOS_SQL: {
				TOPIC_NAME: `todos-v1-${process.env.NODE_ENV}`,
				DLQ_REQUIRED: true,
			},
			TODOS_MONGO: {
				TOPIC_NAME: `todos-v2-${process.env.NODE_ENV}`,,
				DLQ_REQUIRED: true,
			},
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
	},
	SWAGGER: {
		TITLE: "Nestjs Boilerplate",
		DESCRIPTION: "A boilerplate for creating a nestjs project",
		VERSION: "1.0",
		DOCUMENTATION_PATH: "/api/docs",
		JSON_DOCUMENTATION_PATH: "/api/docs-json",
	},
	HTTP_RESPONSE_CODES: {
		FAILED_DEPENDENCY: {
			CODE: 424,
			MESSAGE: "Failed Dependency",
		},
		INTERNAL_SERVER_ERROR: {
			CODE: 500,
			MESSAGE: "Something went wrong",
		},
	},
	DB_SERVICES: {
		MONGO_DB_SERVICE: { PROVIDER_NAME: "MONGO_DB_SERVICE" },
		SQL_DB_SERVICE: { PROVIDER_NAME: "SQL_DB_SERVICE" },
	},
	QUEUE_SERVICES: {
		KAFKA_SERVICE: { PROVIDER_NAME: "KAFKA_SERVICE" },
		ASB_SERVICE: { PROVIDER_NAME: "ASB_SERVICE" },
	},
	CACHING_SERVICES: {
		REDIS: {
			PROVIDER_NAME: "REDIS_SERVICE",
		},
	},
	CONFIGURATION_SERVICE: "ConfigurationService",
} as const;
