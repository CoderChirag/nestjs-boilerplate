import { Agent } from "elastic-apm-node";
import { QueueServiceError } from ".";
import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import {
	IQueueServiceInstance,
	QueueServiceConfig,
	QUEUE_TYPES,
	IKafkaServiceConfig,
	IASBServiceConfig,
} from "./types";
import { ASBService } from "./asb";

export class QueueService<T extends QUEUE_TYPES> {
	private _instance: IQueueServiceInstance<T>;

	constructor(type: T, config: QueueServiceConfig<T>) {
		switch (type) {
			case SUPPORTED_QUEUES.KAFKA:
				(this._instance as any) = new KafkaService(config as IKafkaServiceConfig);
				break;
			case SUPPORTED_QUEUES.ASB:
				(this._instance as any) = new ASBService(config as IASBServiceConfig);
				break;
			default:
				const err = new QueueServiceError(`Queue type not supported: ${type}`);
				((config?.logger || console) as any).error(err.message);
				(config.apm as Agent)?.captureError(err);
				throw err;
		}
	}

	getInstance() {
		return this._instance;
	}
}
