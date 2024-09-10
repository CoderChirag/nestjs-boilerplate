import { Test } from "@nestjs/testing";
import { CheckApiAppHealthController } from "src/services/health-check-service/check-api-app-health.controller";
import { HealthCheckService } from "@nestjs/terminus";
import { CheckApiAppHealthService } from "src/services/health-check-service/check-api-app-health.service";
import { MockCheckApiAppHealthService } from "./check-api-app-health.service.mock";
import { MockHealthCheckService } from "./health-check.service.mock";
import { mockLivenessCheckResponse, mockReadinessCheckResponse } from "./health-checks.mock";

describe("CheckApiAppHealthController", () => {
	let checkApiAppHealthController: CheckApiAppHealthController;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [CheckApiAppHealthController],
			providers: [
				{
					provide: HealthCheckService,
					useValue: MockHealthCheckService,
				},
				{
					provide: CheckApiAppHealthService,
					useValue: MockCheckApiAppHealthService,
				},
			],
		}).compile();

		checkApiAppHealthController = module.get<CheckApiAppHealthController>(
			CheckApiAppHealthController,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("liveness", () => {
		it("should check the liveness of app", async () => {
			MockHealthCheckService.check.mockResolvedValue(mockLivenessCheckResponse);
			const result = await checkApiAppHealthController.checkLiveness();
			expect(result).toMatchObject(mockLivenessCheckResponse);
		});
	});

	describe("readiness", () => {
		it("should check the readiness of app", async () => {
			MockHealthCheckService.check.mockResolvedValue(mockReadinessCheckResponse);
			const result = await checkApiAppHealthController.checkReadiness();
			expect(result).toMatchObject(mockReadinessCheckResponse);
		});
	});
});
