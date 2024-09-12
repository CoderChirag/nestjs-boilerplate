import { Injectable } from "@nestjs/common";
import {
	AxiosInstance,
	AxiosResponse,
	create,
	CreateAxiosDefaults,
	InternalAxiosRequestConfig,
} from "axios";
import { Logger } from "nestjs-pino";

@Injectable()
export class AxiosUtilityService {
	private readonly _axios: AxiosInstance;

	private readonly defaultRequestInterceptor = (config: InternalAxiosRequestConfig) => {
		this.logger.log(
			`Sending AXIOS Request([${config.method?.toUpperCase()}] ${config.baseURL}${config.url})`,
		);
		return config;
	};

	private readonly defaultResponseInterceptor = (config: AxiosResponse) => {
		this.logger.log(
			`AXIOS Response: ${JSON.stringify({ status: config.status, data: config.data })}`,
		);
		return config;
	};

	private readonly defaultErrorInterceptor = (error: any) => {
		this.logger.error(
			`AXIOS Error(${error.config.baseURL}${error.config.url}): ${JSON.stringify({ status: error.response?.status, data: error.response?.data })}`,
		);
		return Promise.reject(error);
	};

	constructor(
		config: CreateAxiosDefaults,
		private readonly logger: Logger,
	) {
		this._axios = create(config);
		this._axios.interceptors.request.use(this.defaultRequestInterceptor);
		this._axios.interceptors.response.use(
			this.defaultResponseInterceptor,
			this.defaultErrorInterceptor,
		);
	}

	get axios() {
		return this._axios;
	}

	addRequestInterceptor(...args: Parameters<typeof this._axios.interceptors.request.use>) {
		return this._axios.interceptors.request.use(...args);
	}

	addResponseInterceptor(...args: Parameters<typeof this._axios.interceptors.response.use>) {
		return this._axios.interceptors.response.use(...args);
	}

	removeRequestInterceptor(interceptorId: number) {
		this._axios.interceptors.request.eject(interceptorId);
	}

	removeResponseInterceptor(interceptorId: number) {
		this._axios.interceptors.response.eject(interceptorId);
	}

	clearRequestInterceptors() {
		this._axios.interceptors.request.clear();
		this._axios.interceptors.request.use(this.defaultRequestInterceptor);
	}

	clearResponseInterceptors() {
		this._axios.interceptors.response.clear();
		this._axios.interceptors.response.use(
			this.defaultResponseInterceptor,
			this.defaultErrorInterceptor,
		);
	}
}
