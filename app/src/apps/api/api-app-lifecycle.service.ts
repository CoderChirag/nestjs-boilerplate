import { resolve } from "node:path";
import { readdir } from "node:fs/promises";
import {
	Inject,
	Injectable,
	Logger,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { KafkaService } from "queue-service";
import { constants } from "src/constants";
import { sigUsrAndSigtermTimeDiffLog } from "src/utility/utility-functions.util";

@Injectable()
export class ApiAppLifecycleService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(ApiAppLifecycleService.name);
	private usrSigTime: number;

	constructor(
		private readonly eventEmitter: EventEmitter2,
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME)
		private readonly kafkaService: KafkaService,
	) {}

	async onApplicationBootstrap() {
		process.on("SIGUSR1", async () => {
			this.usrSigTime = Date.now();
			this.logger.log("SIGUSR1 signal received.");
			this.eventEmitter.emit(constants.INFRA.SHUTDOWN_EVENT, true);
		});

		await this.registerSchemas();
		await this.initializeTopics();
	}

	async onApplicationShutdown(signal?: string) {
		this.logger.log("App Shutdown Signal Received: " + signal);
		sigUsrAndSigtermTimeDiffLog(this.usrSigTime, signal, this.logger);
	}

	private async registerSchemas() {
		const schemasDir = resolve(process.cwd(), "avro-schemas");
		const schemaPaths = await readdir(schemasDir);
		for (const path of schemaPaths) {
			const schemaPath = resolve(schemasDir, path);
			const schemaName = `${path.split(".")[0]}-${process.env.NODE_ENV}`;
			await this.kafkaService.registerSchema(schemaPath, schemaName);
		}
	}

	private async initializeTopics() {
		const topics = Object.values(constants.INFRA.PUBLISH_TOPICS).map((topic) => ({ topic }));
		for (const topic of topics) {
			await this.kafkaService.createTopic(topic);
		}
	}
}
