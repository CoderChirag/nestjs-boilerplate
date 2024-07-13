import _ from "lodash";
import apm from "elastic-apm-node";
import pino from "pino";
import tracer from "cls-rtracer";
import { Params as PinoParams } from "nestjs-pino";
import { IncomingMessage } from "http";
import { randomUUID } from "crypto";

const maskedLoggerKeys = {
	paths: [
		'request.headers["x-authorization"]',
		'request.headers["x-user-detail"]',
		'request.headers["Authorization"]',
	],
	censor: "**SECRET**",
};

const headersToRemove = [
	"accept",
	"accept-encoding",
	"accept-language",
	"cache-control",
	"connection",
	"content-length",
	"content-type",
	"host",
	"origin",
	"user-agent",
	"referer",
	"upgrade-insecure-requests",
	"x-forwarded-for",
	"x-forwarded-proto",
	"x-requested-with",
	"x-powered-by",
	"etag",
	"x-authorization",
	"postman-token",
	"x-powered-by",
];

const formatters = {
	log(object: Record<string, unknown>): Record<string, unknown> {
		const trace = apm?.currentTraceIds;
		const reqId = tracer.id();

		if (!trace) return object;

		const traceContext = {
			traceId: trace["trace.id"],
			spanId: trace["span.id"],
			transactionId: trace["transaction.id"],
			reqId,
		};

		return { ...object, traceContext };
	},
};

export const loggerConfigurations: PinoParams = {
	pinoHttp: {
		logger: pino({ formatters }),
		// this configurations are for object masking to hide sensitive info
		redact: maskedLoggerKeys,
		//For customising default key names customAttributeKeys can be passed with key as the old attribute name and value as the new name .
		customAttributeKeys: {
			req: "Request",
			res: "Response",
			err: "Error",
			responseTime: "Response Time",
		},
		autoLogging: {
			ignore: (req) =>
				(req as unknown as IncomingMessage & { originalUrl: string }).originalUrl.startsWith(
					"/probes",
				),
		},
		customLogLevel: (_req, res, error) => {
			if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
			if (res.statusCode >= 500 || error) return "error";
			return "info";
		},
		formatters,
		genReqId: function (req: any, res: any) {
			if (req.id) return req.id;
			let id = req.get("X-Request-Id");
			if (id) return id;
			id = apm?.currentTraceIds["trace.id"] || randomUUID();
			res.header("X-Request-Id", id);
			return id;
		},
		serializers: {
			request: (req: Request) => ({
				headers: _.omit(req.headers, headersToRemove),
				method: req.method,
				url: req.url,
				body: req.body,
			}),
			response: (res: Response) => ({
				statusCode: res.status,
				body: res,
				headers: _.omit(res.headers, headersToRemove),
			}),
			error: (error: Error) => ({
				message: error.message,
			}),
		},
		//the transport options runs prettier operations on logs for better readability in elk and hiding/ignoring sensitive fields.
		transport: {
			target: "pino-pretty",
			options: {
				//Adds terminal color escape sequences to the output.
				colorize: true,
				//Display the log level name before the logged date and time.
				levelFirst: true,
				//Print each log message on a single line (errors will still be multi-line)
				singleLine: true,
				// Translate the epoch time value into a human-readable date and time string.
				translateTime: "SYS:mm/dd/yyyy, h:MM:ss TT Z",
				//Ignore one or several keys, nested keys are supported with each property delimited by a dot character (.)
				ignore:
					"pid,hostname,auth,headers,config,request,$__,ExternalCallID,ExternalCallTo,transitional,transformRequest,error.config,err.config,err.stack,error.stack,err.auth,error.auth",
				//Define the log keys that are associated with error like objects.
				errorLikeObjectKeys: ["err", "error"],
				//): Format output of message
				messageFormat:
					"[TR_ID:'{request.id}'] [URL:{request.url}] {ExternalCallID} {ExternalCallTo}",
				ecsFormat: true,
				hideObject: false,
			},
		},
	},
};
