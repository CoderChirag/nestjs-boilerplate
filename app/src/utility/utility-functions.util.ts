import { HttpException } from "@nestjs/common";
import { isAxiosError } from "axios";
import { constants } from "src/constants";

export const sigUsrAndSigtermTimeDiffLog = (
	prevSigTime: number,
	currentSignal: string | undefined,
	logger: any,
) => {
	const timeDiff = Date.now() - prevSigTime;
	logger.log(`Time difference between SIGUSR1 and SIGTERM: ${timeDiff} milliseconds`);
};

export function handleAxiosError(e: unknown, status?: number): never {
	if (isAxiosError(e))
		throw new HttpException(
			{
				status: e.status,
				message: e.message,
				data: { ...e.response?.data },
			},
			status ?? constants.HTTP_RESPONSE_CODES.FAILED_DEPENDENCY.CODE,
		);

	throw new HttpException(
		e && typeof e === "object"
			? e
			: e?.toString() || constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.MESSAGE,
		constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.CODE,
	);
}
