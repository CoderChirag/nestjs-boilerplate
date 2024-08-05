import apm from "elastic-apm-node";

export class ElasticApmModule {
	static init() {
		apm.start({
			active: process.env.APM_ACTIVE === "true",
			serviceName: process.env.APM_SERVICE_NAME,
			serverUrl: process.env.APM_SERVER_URL,
			environment: process.env.NODE_ENV,
			captureBody: "all",
			captureHeaders: true,
			captureErrorLogStackTraces: "always",
			errorOnAbortedRequests: true,
			captureExceptions: true,
		});
	}
}
