import apm from "elastic-apm-node";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { constants } from "src/constants";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		apm.captureError(exception);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = exception?.status ?? constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.CODE;
		console.log(exception);

		const error = errorCodeRespConstructor(exception, status);
		response.status(status).json(error);
	}
}

function errorCodeRespConstructor(error: any, status: number) {
	const response = new BaseErrorResponseDto();
	const statusMessage = Object.values(constants.HTTP_RESPONSE_CODES).find(
		(code) => code.CODE == status,
	);
	response.success = false;
	response.error = {
		message: statusMessage
			? statusMessage.MESSAGE
			: (error?.message ?? constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.MESSAGE),
		failures: {
			message: error?.message ?? constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.MESSAGE,
			...(error?.response?.data ?? error?.response ?? error?.data ?? {}),
		},
	};

	return response;
}
