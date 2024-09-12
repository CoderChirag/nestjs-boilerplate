import { Provider } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { QUEUE_TYPES, QueueService, QueueServiceConfig } from "queue-service";

export const QueueProvider = <T extends QUEUE_TYPES>(
	name: string,
	type: T,
	config: QueueServiceConfig<T>,
	withTransactionLogger?: boolean,
): Provider => {
	return {
		provide: name,
		useFactory: withTransactionLogger
			? async (logger: Logger) => {
					config.transactionLogger = logger;
					return await queueServiceFactory(type, config);
				}
			: async () => await queueServiceFactory(type, config),
		...(withTransactionLogger && { inject: [Logger] }),
	};
};

async function queueServiceFactory<T extends QUEUE_TYPES>(type: T, config: QueueServiceConfig<T>) {
	const queueService = new QueueService<T>(type, config).getInstance();
	if ("connect" in queueService) await queueService.connect();
	(queueService as any).onApplicationShutdown = async () => {
		if ("disconnect" in queueService) await queueService.disconnect();
	};
	return queueService;
}
