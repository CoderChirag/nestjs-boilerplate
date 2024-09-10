import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { DBServicesProvider } from "src/services/db-services/db-services.provider";
import { CheckApiAppHealthService } from "src/services/health-check-service/check-api-app-health.service";
import { MockDBServicesProvider } from "test/unit/mocks/db-services/db-services.provider.mock";
import { mockDBServicesStatusCheckResponse, mockShutdownCheckResponse } from "./health-checks.mock";

describe("CheckApiAppHealthService", () => {
	let checkApiAppHealthService: CheckApiAppHealthService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CheckApiAppHealthService,
				{
					provide: DBServicesProvider,
					useValue: MockDBServicesProvider,
				},
			],
		}).compile();

		checkApiAppHealthService = module.get<CheckApiAppHealthService>(CheckApiAppHealthService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("isShutdownModeActivated", () => {
		it("should return wether shutdown mode is activated", async () => {
			const result = await checkApiAppHealthService.isShutdownModeActivated(
				constants.INFRA.HEALTH_CHECKS.SHUTDOWN_CHECK,
			);
			expect(result).toMatchObject(mockShutdownCheckResponse);
		});

		it("should throw an error if shutdown mode is activated", async () => {
			checkApiAppHealthService.onShutdownEvent();
			await expect(
				checkApiAppHealthService.isShutdownModeActivated(
					constants.INFRA.HEALTH_CHECKS.SHUTDOWN_CHECK,
				),
			).rejects.toThrow();
		});
	});

	describe("dbServicesReady", () => {
		it("should return wether db services are ready", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(true);
			const result = await checkApiAppHealthService.dbServicesReady(
				constants.INFRA.HEALTH_CHECKS.DB_SERVICES_STATUS_CHECK,
			);
			expect(result).toMatchObject(mockDBServicesStatusCheckResponse);
		});

		it("should throw an error if db services are not ready", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(false);
			await expect(
				checkApiAppHealthService.dbServicesReady(
					constants.INFRA.HEALTH_CHECKS.DB_SERVICES_STATUS_CHECK,
				),
			).rejects.toThrow();
		});
	});
});
