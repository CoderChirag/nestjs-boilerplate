export const SUPPORTED_QUEUES = {
	KAFKA: "kafka",
	ASB: "asb",
} as const;

export const DLQ_ERROR_SOURCES = {
	PRODUCER: "PRODUCER_ERROR",
	CONSUMER: "CONSUMER_ERROR",
};
