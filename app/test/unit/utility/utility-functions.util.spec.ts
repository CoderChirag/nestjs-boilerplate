import { handleError, sigUsrAndSigtermTimeDiffLog } from "src/utility/utility-functions.util";
import { mockSigUsrAndSigtermTimeDiffLogParams } from "./utility.mock";
import { AxiosError } from "axios";

describe("UtilityFunctions", () => {
	describe("sigUsrAndSigtermTimeDiffLog", () => {
		it("should log the time difference between SIGUSR1 and SIGTERM signals", () => {
			const { prevSigTime, currentSignal, logger } = mockSigUsrAndSigtermTimeDiffLogParams;
			sigUsrAndSigtermTimeDiffLog(prevSigTime, currentSignal, logger);
			expect(logger.log).toHaveBeenCalled();
		});
	});

	describe("handleError", () => {
		it("should throw an HttpException with the Axios error response message and status code", () => {
			const error = new AxiosError("error");
			expect(() => handleError(error)).toThrow();
		});

		it("should throw an HttpException with the error message and status code", () => {
			const error = new Error("Test error");
			expect(() => handleError(error)).toThrow();
		});
	});
});
