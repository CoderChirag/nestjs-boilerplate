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
import { ASBService, KafkaService } from "queue-service";
import { constants } from "src/constants";
import { DBServicesProvider } from "src/services/db-services/db-services.provider";
import { sigUsrAndSigtermTimeDiffLog } from "src/utility/utility-functions.util";
import { Interval } from "@nestjs/schedule";
import { TodosProcessorService } from "src/modules/todos-processor/todos-processor.service";
import { ProcessorAppEnvSchema } from "src/dtos/processor-app-env.schema";

@Injectable()
export class PubSubProcessorService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(PubSubProcessorService.name);
	private usrSigTime: number;

	constructor(
		@Inject(constants.QUEUE_SERVICES.KAFKA_SERVICE) private readonly kafkaService: KafkaService,
		@Inject(constants.QUEUE_SERVICES.ASB_SERVICE) private readonly asbService: ASBService,
		@Inject(constants.CONFIGURATION_SERVICE) private readonly configService: ProcessorAppEnvSchema,
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
			await this.asbService.disconnect();
			this.logger.log(`${this.configService.APP_NAME}: All consumers for this pod are paused`);
		});

		await this.kafkaService.consumer.subscribe(
			{
				groupId: constants.INFRA.CONSUMER_GROUPS.TODOS_SQL.GROUP_ID,
			},
			{
				topics: constants.INFRA.CONSUMER_GROUPS.TODOS_SQL.TOPICS,
				dlqRequired: true,
				schemaEnabled: true,
			},
			this.todoProcessorService.processTodos,
			this.todoProcessorService.logger,
		);

		await this.kafkaService.consumer.subscribe(
			{ groupId: constants.INFRA.CONSUMER_GROUPS.TODOS_MONGO.GROUP_ID },
			{
				topics: constants.INFRA.CONSUMER_GROUPS.TODOS_MONGO.TOPICS,
				dlqRequired: true,
				schemaEnabled: true,
			},
			this.todoProcessorService.processTodos,
			this.todoProcessorService.logger,
		);

		await this.asbService.consumer.subscribe(
			{ queueName: constants.INFRA.ASB_QUEUES.TODOS_SQL },
			this.todoProcessorService.processTodosFromASB,
			this.asbService.consumer.defaultErrorProcessor,
			{},
			this.todoProcessorService.logger,
		);

		await this.asbService.consumer.subscribe(
			{ queueName: constants.INFRA.ASB_QUEUES.TODOS_MONGO },
			this.todoProcessorService.processTodosFromASB,
			this.asbService.consumer.defaultErrorProcessor,
			{},
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
