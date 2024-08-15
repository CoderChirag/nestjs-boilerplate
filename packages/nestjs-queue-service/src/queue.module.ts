import { DynamicModule, Module } from "@nestjs/common";
import { QUEUE_TYPES, QueueServiceConfig } from "queue-service";
import { QueueProvider } from "./queue.provider";

export interface QueueConfig<T extends QUEUE_TYPES> {
	type: T;
	providerName: string;
	global?: boolean;
	config: QueueServiceConfig<T>;
}

@Module({})
export class QueueModule {
	static forRoot<T extends QUEUE_TYPES>(queueConfig: QueueConfig<T>): DynamicModule {
		return {
			module: QueueModule,
			providers: [QueueProvider(queueConfig.providerName, queueConfig.type, queueConfig.config)],
			exports: [queueConfig.providerName],
			global: queueConfig.global ?? true,
		};
	}
}
