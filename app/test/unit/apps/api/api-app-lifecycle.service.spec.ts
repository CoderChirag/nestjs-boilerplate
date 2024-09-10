import fs from "node:fs/promises";
import { resolve } from "node:path";
import { Test } from "@nestjs/testing";
import { constants } from "src/constants";
import { ApiAppLifecycleService } from "src/apps/api/api-app-lifecycle.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MockKafkaService } from "test/unit/mocks/external-services/kafka/kafka.service.mock";
import { MockEventEmitterService } from "./event-emitter.service.mock";

describe("ApiAppLifecycleService", () => {
	let apiAppLifecycleService: ApiAppLifecycleService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ApiAppLifecycleService,
				{
					provide: EventEmitter2,
					useValue: MockEventEmitterService,
				},
				{
					provide: constants.QUEUE_SERVICES.KAFKA_SERVICE.PROVIDER_NAME,
					useValue: MockKafkaService,
				},
			],
		}).compile();

		apiAppLifecycleService = module.get<ApiAppLifecycleService>(ApiAppLifecycleService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("onApplicationBootstrap", () => {
		it("should register schemas and initialize topics", async () => {
			jest.spyOn<any, any>(fs, "readdir").mockResolvedValueOnce(["test.avsc"]);

			await apiAppLifecycleService.onApplicationBootstrap();

			expect(MockKafkaService.registerSchema).toHaveBeenCalledWith(
				resolve(process.cwd(), "avro-schemas", "test.avsc"),
				`test-${process.env.NODE_ENV}`,
			);
			expect(MockKafkaService.createTopic).toHaveBeenCalled();
		});
	});

	describe("onApplicationShutdown", () => {
		it("should log app shutdown signal", async () => {
			const res = await apiAppLifecycleService.onApplicationShutdown("SIGTERM");

			expect(res).toBe(undefined);
		});
	});
});
