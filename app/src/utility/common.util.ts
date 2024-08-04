export const sigUsrAndSigtermTimeDiffLog = (
	prevSigTime: number,
	currentSignal: string | undefined,
	logger: any,
) => {
	const timeDiff = Date.now() - prevSigTime;
	logger.log(`Time difference between SIGUSR1 and SIGTERM: ${timeDiff} milliseconds`);
};
