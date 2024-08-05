import { Controller, Get, Logger } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheckService } from "@nestjs/terminus";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { CheckApiAppHealthService } from "./check-api-app-health.service";
import { constants } from "src/constants";
import { HttpResponseDto } from "src/dtos/http-response.dto";

@ApiTags("Health Check")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
@Controller("health")
export class CheckApiAppHealthController {
	private readonly logger = new Logger(CheckApiAppHealthController.name);
	constructor(
		private readonly health: HealthCheckService,
		private readonly customCheck: CheckApiAppHealthService,
	) {}

	@ApiOperation({ summary: "Liveness Check" })
	@ApiResponse({
		status: 200,
		type: HttpResponseDto,
	})
	@Get("liveness")
	checkLiveness() {
		this.logger.log("Checking Liveness");
		return this.health.check([
			() =>
				this.customCheck.dbServicesReady(constants.INFRA.HEALTH_CHECKS.DB_SERVICES_STATUS_CHECK),
		]);
	}

	@ApiOperation({ summary: "Readiness Check" })
	@ApiResponse({
		status: 200,
		type: HttpResponseDto,
	})
	@Get("readiness")
	checkReadiness() {
		this.logger.log("Checking Readiness");
		return this.health.check([
			() => this.customCheck.isShutdownModeActivated(constants.INFRA.HEALTH_CHECKS.SHUTDOWN_CHECK),
			() =>
				this.customCheck.dbServicesReady(constants.INFRA.HEALTH_CHECKS.DB_SERVICES_STATUS_CHECK),
		]);
	}
}
