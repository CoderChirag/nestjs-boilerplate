const apm = require("elastic-apm-node");
let isMainThread;
try {
  const workerThreads = require("worker_threads");
  isMainThread = workerThreads.isMainThread;
} catch (_importErr) {
  isMainThread = true;
}

if (isMainThread) {
  /** @type import("elastic-apm-node").AgentConfigOptions */
  const options = {
    active: process.env.APM_ACTIVE === "true",
    serviceName: process.env.APM_SERVICE_NAME,
    serverUrl: process.env.APM_SERVER_URL,
    environment: process.env.NODE_ENV,
    captureBody: "all",
    captureHeaders: true,
    captureErrorLogStackTraces: "always",
    errorOnAbortedRequests: true,
    captureExceptions: true,
    instrument: true,
    logLevel: "debug",
  };
  apm.start(options);
}

module.exports = apm;
