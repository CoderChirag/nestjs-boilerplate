import fs from "node:fs/promises";
import { Test } from "@nestjs/testing";
import { PubSubProcessorService } from "src/apps/pub-sub-processor/pub-sub-processor.service";
import { constants } from "src/constants";
import { TodosProcessorService } from "src/modules/todos-processor/todos-processor.service";
import { DBServicesProvider } from "src/services/db-services/db-services.provider";
import { MockDBServicesProvider } from "test/unit/mocks/db-services/db-services.provider.mock";
import { MockASBService } from "test/unit/mocks/external-services/asb/asb.service.mock";
import { MockKafkaService } from "test/unit/mocks/external-services/kafka/kafka.service.mock";
import { MockTodosProcessorService } from "test/unit/modules/todos-processor/todos-processor.service.mock";

describe("PubSubProcessorService", () => {
	let pubSubProcessorService: PubSubProcessorService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				PubSubProcessorService,
				{
					provide: constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME,
					useValue: MockKafkaService,
				},
				{
					provide: constants.QUEUE_SERVICES.ASB_SERVICE.PROVIDER_NAME,
					useValue: MockASBService,
				},
				{
					provide: constants.CONFIGURATION_SERVICE,
					useValue: {
						APP_NAME: "test-processor-app",
					},
				},
				{
					provide: DBServicesProvider,
					useValue: MockDBServicesProvider,
				},
				{
					provide: TodosProcessorService,
					useValue: MockTodosProcessorService,
				},
			],
		}).compile();

		pubSubProcessorService = module.get<PubSubProcessorService>(PubSubProcessorService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("onApplicationShutdown", () => {
		it("should log app shutdown signal", async () => {
			const res = await pubSubProcessorService.onApplicationShutdown("SIGTERM");

			expect(res).toBe(undefined);
		});
	});

	describe("onApplicationBootstrap", () => {
		it("should register kafka & asb consumers", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(false);
			await pubSubProcessorService.onApplicationBootstrap();

			expect(MockKafkaService.consumer.subscribe).toHaveBeenCalledTimes(2);
			expect(MockASBService.consumer.subscribe).toHaveBeenCalledTimes(2);
		});
	});

	describe("checkLiveness", () => {
		it("should check for liveness of app", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(true);
			jest.spyOn<any, any>(fs, "mkdir").mockResolvedValue(undefined);
			jest.spyOn<any, any>(fs, "writeFile").mockResolvedValue(undefined);

			const res = await pubSubProcessorService.checkLiveness();

			expect(res).toBe(undefined);
			expect(fs.mkdir).toHaveBeenCalledTimes(1);
			expect(fs.writeFile).toHaveBeenCalledTimes(1);
		});

		it("should return if db services are not ready", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(false);

			const res = await pubSubProcessorService.checkLiveness();

			expect(res).toBe(undefined);
		});

		it("should handle if fs.mkdir fails", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(true);
			jest.spyOn<any, any>(fs, "mkdir").mockRejectedValue(new Error("test-error"));

			const res = await pubSubProcessorService.checkLiveness();

			expect(res).toBe(undefined);
			expect(fs.mkdir).toHaveBeenCalledTimes(1);
			expect(fs.writeFile).toHaveBeenCalledTimes(0);
		});

		it("should handle if fs.writeFile fails", async () => {
			MockDBServicesProvider.getConnectionStatus.mockResolvedValue(true);
			jest.spyOn<any, any>(fs, "mkdir").mockResolvedValue(undefined);
			jest.spyOn<any, any>(fs, "writeFile").mockRejectedValue(new Error("test-error"));

			const res = await pubSubProcessorService.checkLiveness();

			expect(res).toBe(undefined);
			expect(fs.mkdir).toHaveBeenCalledTimes(1);
			expect(fs.writeFile).toHaveBeenCalledTimes(1);
		});
	});
});
