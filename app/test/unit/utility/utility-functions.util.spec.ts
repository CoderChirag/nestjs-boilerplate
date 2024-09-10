import { sigUsrAndSigtermTimeDiffLog } from "src/utility/utility-functions.util";
import { mockSigUsrAndSigtermTimeDiffLogParams } from "./utility.mock";

describe("UtilityFunctions", () => {
	describe("sigUsrAndSigtermTimeDiffLog", () => {
		it("should log the time difference between SIGUSR1 and SIGTERM signals", () => {
			const { prevSigTime, currentSignal, logger } = mockSigUsrAndSigtermTimeDiffLogParams;
			sigUsrAndSigtermTimeDiffLog(prevSigTime, currentSignal, logger);
			expect(logger.log).toHaveBeenCalled();
		});
	});
});
