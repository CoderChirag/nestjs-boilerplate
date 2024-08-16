import { Agent } from "elastic-apm-node";
import { mkdirSync, writeFile } from "fs";
import { dirname } from "node:path";

export const sigUsrAndSigtermTimeDiffLog = (
	prevSigTime: number,
	currentSignal: string | undefined,
	logger: any,
) => {
	const timeDiff = Date.now() - prevSigTime;
	logger.log(`Time difference between SIGUSR1 and SIGTERM: ${timeDiff} milliseconds`);
};

export const livenessCheckWithTimestamp = async (
	filePath: string,
	writeInterval: number,
	apm: Agent,
	logger: any,
	dbServiceCheck: Function,
) => {
	mkdirSync(dirname(filePath), { recursive: true });

	writeFile(filePath, new Date().toISOString(), (err) => {
		if (err) {
			apm.captureError(err);
			logger.error(`Error creating timestamp file: ${err.message}`);
		} else {
			logger.log(`Successfully created timestamp file.`);
		}
	});
	setInterval(async () => {
		const timestamp = new Date().toISOString();
		if (!(await dbServiceCheck())) {
			return;
		}
		writeFile(filePath, timestamp, (err) => {
			if (err) {
				apm.captureError(err);
				logger.error(`Error writing timestamp to file: ${err.message}`);
			} else {
				logger.log(`Successfully wrote timestamp to file: ${timestamp}`);
			}
		});
	}, writeInterval);
};
