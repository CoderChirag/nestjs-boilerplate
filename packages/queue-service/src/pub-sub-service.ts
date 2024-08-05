import { SUPPORTED_QUEUES } from "./constants";
import { KafkaService } from "./kafka/kafka-service";
import { IPubSubServiceInstance, PubSubServiceConfig, QUEUE_TYPES } from "./types";

export class PubSubService<T extends QUEUE_TYPES> {
	private _instance: IPubSubServiceInstance<T>;

	constructor(type: T, config: PubSubServiceConfig<T>) {
		switch (type) {
			case SUPPORTED_QUEUES.KAFKA:
				(this._instance as any) = new KafkaService(config);
				break;
		}
	}

	getInstance() {
		return this._instance;
	}
}
