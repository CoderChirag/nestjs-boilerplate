import apm from "elastic-apm-node";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
	Inject,
	Injectable,
	Logger,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KafkaService } from "queue-service";
import { constants } from "src/constants";
import { DBServicesProvider } from "src/services/db-services/db-services.provider";
import { sigUsrAndSigtermTimeDiffLog } from "src/utility/utility-functions.util";
import { Interval } from "@nestjs/schedule";
import { TodosProcessorService } from "src/modules/todos-processor/todos-processor.service";

@Injectable()
export class PubSubProcessorService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(PubSubProcessorService.name);
	private usrSigTime: number;

	constructor(
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) private readonly kafkaService: KafkaService,
		private readonly configService: ConfigService,
		private readonly dbServicesProvider: DBServicesProvider,
		private readonly todoProcessorService: TodosProcessorService,
	) {}

	onApplicationShutdown(signal?: string) {
		this.logger.log("App Shutdown Signal Received: " + signal);
		sigUsrAndSigtermTimeDiffLog(this.usrSigTime, signal, this.logger);
	}

	async onApplicationBootstrap() {
		process.on("SIGUSR1", async () => {
			this.usrSigTime = Date.now();
			this.logger.log("SIGUSR1 signal received.");
			await this.kafkaService.disconnect();
			this.logger.log(
				`${this.configService.get("APP_NAME")}: All consumers for this pod are paused`,
			);
		});

		await this.kafkaService.consumer.subscribe(
			{
				groupId: this.configService.get("TODOS_PROCESSOR_GROUP_ID")!,
			},
			{ topics: this.configService.get("TODOS_PROCESSOR_TOPICS")!.split(",") },
			this.todoProcessorService.processTodos,
			true,
			this.todoProcessorService.logger,
		);

		await this.checkLiveness();
	}

	@Interval(Number(process.env.LIVENESS_WRITE_INTERVAL) || 5000)
	async checkLiveness() {
		if (!(await this.dbServicesProvider.getConnectionStatus())) {
			return;
		}
		const timestamp = new Date().toISOString();
		await this.writeLivenessFile(constants.INFRA.LIVENESS.FILE_PATH, timestamp);
	}

	async writeLivenessFile(filePath: string, timestamp: string) {
		try {
			await mkdir(dirname(filePath), { recursive: true });
		} catch (err: any) {
			apm.captureError(err);
			this.logger.error(`Error creating directory for Liveness File: ${err.message}`);
		}

		try {
			await writeFile(filePath, timestamp);
			this.logger.log(`Successfully wrote timestamp to file: ${timestamp}`);
		} catch (err: any) {
			apm.captureError(err);
			this.logger.error(`Error writing timestamp file: ${err.message}`);
		}
	}
}
