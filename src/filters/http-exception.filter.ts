import apm from "elastic-apm-node";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { ErrorResponseDto } from "src/exceptions/response.dto";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		apm.captureError(exception);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception?.status ?? 500;

		const error = errorCodeRespConstructor(exception);
		response.status(status).json(error);
	}
}

function errorCodeRespConstructor(error: any) {
	const response = new ErrorResponseDto();
	response.success = false;
	response.error = {
		message: error?.message ?? "Something went wrong",
		failures: error?.response ?? error?.data ?? {},
	};

	return response;
}
