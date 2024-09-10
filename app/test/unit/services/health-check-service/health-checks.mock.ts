export const mockShutdownCheckResponse = {
	shutDownCheck: {
		status: "up",
	},
};

export const mockDBServicesStatusCheckResponse = {
	dbServicesStatusCheck: {
		status: "up",
	},
};

export const mockLivenessCheckResponse = {
	status: "ok",
	info: mockDBServicesStatusCheckResponse,
	error: {},
	details: mockDBServicesStatusCheckResponse,
};

export const mockReadinessCheckResponse = {
	status: "ok",
	info: {
		...mockDBServicesStatusCheckResponse,
		...mockShutdownCheckResponse,
	},
	error: {},
	details: {
		...mockDBServicesStatusCheckResponse,
		...mockShutdownCheckResponse,
	},
};
