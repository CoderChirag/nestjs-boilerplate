import { Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator } from "@nestjs/terminus";
import { DBServicesProvider } from "../db-services/db-services.provider";
import { OnEvent } from "@nestjs/event-emitter";
import { constants } from "src/constants";

@Injectable()
export class CheckApiAppHealthService extends HealthIndicator {
	private shutdownMode = false;

	constructor(private readonly dbServicesProvider: DBServicesProvider) {
		super();
	}

	async isShutdownModeActivated(key: string) {
		if (!this.shutdownMode) return this.getStatus(key, true);

		throw new HealthCheckError("Shutdown mode on", this.getStatus(key, false));
	}

	async dbServicesReady(key: string) {
		const dbServicesReady = await this.dbServicesProvider.getConnectionStatus();
		if (!dbServicesReady)
			throw new HealthCheckError("DB services are not ready", this.getStatus(key, false));
		return this.getStatus(key, true);
	}

	@OnEvent(constants.INFRA.SHUTDOWN_EVENT)
	onShutdownEvent() {
		this.shutdownMode = true;
	}
}
