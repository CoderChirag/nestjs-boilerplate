import { ConfigurationService } from "src/services/configuration-service/configuration-service.service";
import { MockConfigurationSchema, mockEnv, mockNegativeEnv } from "./configuration-service.mock";

describe("ConfigurationService", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("validate", () => {
		it("should validate env", async () => {
			const configurationService = new ConfigurationService(
				MockConfigurationSchema,
				mockEnv,
				(env) => env,
			);
			const result = await configurationService.validate();
			expect(result).toBe(undefined);
		});

		it("should through error on wrong env", async () => {
			const configurationService = new ConfigurationService(
				MockConfigurationSchema,
				mockNegativeEnv,
				(env) => env,
			);
			try {
				await configurationService.validate();
			} catch (e: any) {
				expect(e.name).toBe("ConfigValidationError");
				expect(e.message).toBe(`Validation failed: [{"isString":"APP_NAME must be a string"}]`);
			}
		});
	});

	describe("get config", () => {
		it("should return config", () => {
			const configurationService = new ConfigurationService(
				MockConfigurationSchema,
				mockEnv,
				(env) => env,
			);
			const result = configurationService.config;
			expect(result).toEqual(mockEnv);
		});
	});
});
