import axios from "axios";
import { AxiosService } from "src/services/axios-service/axios.service";
import { mockAxiosCreateConfig, MockAxiosInstance } from "./axios.mock";
import { MockPinoLoggerService } from "test/unit/mocks/common.mock";
import { Logger } from "nestjs-pino";

describe("AxiosService", () => {
	let axiosService: AxiosService;

	beforeEach(async () => {
		jest.spyOn(axios, "create").mockReturnValue(MockAxiosInstance);
		MockAxiosInstance.interceptors.request.use.mockReturnValue(0);
		MockAxiosInstance.interceptors.response.use.mockReturnValue(0);

		axiosService = new AxiosService(
			mockAxiosCreateConfig,
			MockPinoLoggerService as unknown as Logger,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("get axios", () => {
		it("should return axios instance", () => {
			expect(axiosService.axios).toBe(MockAxiosInstance);
		});
	});

	describe("addRequestInterceptor", () => {
		it("should add request interceptor", () => {
			const requestInterceptor = jest.fn();

			axiosService.addRequestInterceptor(requestInterceptor);

			expect(MockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(requestInterceptor);
		});
	});

	describe("addResponseInterceptor", () => {
		it("should add response interceptor", () => {
			const responseInterceptor = jest.fn();

			axiosService.addResponseInterceptor(responseInterceptor);

			expect(MockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(responseInterceptor);
		});
	});

	describe("removeRequestInterceptor", () => {
		it("should remove request interceptor", () => {
			const requestInterceptorId = 0;

			axiosService.removeRequestInterceptor(requestInterceptorId);

			expect(MockAxiosInstance.interceptors.request.eject).toHaveBeenCalledWith(
				requestInterceptorId,
			);
		});
	});

	describe("removeResponseInterceptor", () => {
		it("should remove response interceptor", () => {
			const responseInterceptorId = 0;

			axiosService.removeRequestInterceptor(responseInterceptorId);

			expect(MockAxiosInstance.interceptors.request.eject).toHaveBeenCalledWith(
				responseInterceptorId,
			);
		});
	});

	describe("clearRequestInterceptors", () => {
		it("should clear request interceptors", () => {
			axiosService.clearRequestInterceptors();

			expect(MockAxiosInstance.interceptors.request.clear).toHaveBeenCalled();
			expect(MockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
		});
	});

	describe("clearResponseInterceptors", () => {
		it("should clear response interceptors", () => {
			axiosService.clearResponseInterceptors();

			expect(MockAxiosInstance.interceptors.response.clear).toHaveBeenCalled();
			expect(MockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
		});
	});
});
