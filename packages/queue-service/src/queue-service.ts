import { Agent, logger } from "elastic-apm-node";
import { QueueServiceError } from ".";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import { IQueueServiceInstance, QueueServiceConfig, QUEUE_TYPES } from "./types";

export class QueueService<T extends QUEUE_TYPES> {
	private _instance: IQueueServiceInstance<T>;

	constructor(type: T, config: QueueServiceConfig<T>) {
		switch (type) {
			case SUPPORTED_QUEUES.KAFKA:
				(this._instance as any) = new KafkaService(config);
				break;
			default:
				const err = new QueueServiceError("Queue type not supported");
				(logger as any).error(`Queue type not supported: ${type}`);
				(config.apm as Agent)?.captureError(err);
				throw err;
		}
	}

	getInstance() {
		return this._instance;
	}
}
