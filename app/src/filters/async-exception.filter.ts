import apm from "elastic-apm-node";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Logger } from "nestjs-pino";

@Catch()
export class AsyncExceptionFilter implements ExceptionFilter {
	constructor(private logger: Logger) {}
	catch(exception: any, host: ArgumentsHost) {
		apm.captureError(exception);
		this.logger.error(exception);
	}
}
