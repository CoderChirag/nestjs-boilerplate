import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { constants } from "src/constants";
import { sigUsrAndSigtermTimeDiffLog } from "src/utility/common.util";
import { setTimeout } from "timers/promises";

@Injectable()
export class ApiAppLifecycleService implements OnApplicationBootstrap, OnApplicationShutdown {
	private readonly logger = new Logger(ApiAppLifecycleService.name);
	private usrSigTime: number;

	constructor(private readonly eventEmitter: EventEmitter2) {}

	onApplicationBootstrap() {
		process.on("SIGUSR1", async () => {
			this.usrSigTime = Date.now();
			this.logger.log("SIGUSR1 signal received.");
			this.eventEmitter.emit(constants.INFRA.SHUTDOWN_EVENT, true);
		});
	}

	async onApplicationShutdown(signal?: string) {
		this.logger.log("App Shutdown Signal Received: " + signal);
		sigUsrAndSigtermTimeDiffLog(this.usrSigTime, signal, this.logger);
	}
}
