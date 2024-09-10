export const mockSigUsrAndSigtermTimeDiffLogParams = {
	prevSigTime: Date.now(),
	currentSignal: "SIGTERM",
	logger: {
		log: jest.fn(),
	},
};
