import apm from "elastic-apm-node";

export class ElasticApmModule {
	static init() {
		apm.start({
			active: process.env.NODE_ENV !== "local",
			serviceName: process.env.APM_SERVICE_NAME,
			serverUrl: process.env.APM_SERVER_URL,
			environment: process.env.NODE_ENV,
			captureBody: "all",
			captureHeaders: true,
			captureErrorLogStackTraces: "always",
			errorOnAbortedRequests: true,
			instrument: true,
			exitSpanMinDuration: "0ms",
			breakdownMetrics: true,
			usePathAsTransactionName: true,
		});
	}
}
