import { Provider } from "@nestjs/common";
import { QUEUE_TYPES, QueueService, QueueServiceConfig } from "queue-service";

export const QueueProvider = <T extends QUEUE_TYPES>(
	name: string,
	type: T,
	config: QueueServiceConfig<T>,
): Provider => {
	return {
		provide: name,
		useFactory: async () => {
			const queueService = new QueueService<T>(type, config).getInstance();
			if ("connect" in queueService) await queueService.connect();
			(queueService as any).onApplicationShutdown = async () => {
				if ("disconnect" in queueService) await queueService.disconnect();
			};
			return queueService;
		},
	};
};
