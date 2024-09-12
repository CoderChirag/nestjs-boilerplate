import { Injectable } from "@nestjs/common";
import { AxiosInstance, create, CreateAxiosDefaults } from "axios";
import { Logger } from "nestjs-pino";

@Injectable()
export class AxiosUtilityService {
	private readonly _axios: AxiosInstance;

	constructor(
		config: CreateAxiosDefaults,
		private readonly logger: Logger,
	) {
		this._axios = create(config);
		this._axios.interceptors.response.use((config) => {
			this.logger.log(
				`AXIOS Response(${config.request?.url}): ${JSON.stringify({ status: config.status, data: config.data })}`,
			);
			return config;
		});
		this._axios.interceptors.response.use((config) => {
			this.logger.log(`AXIOSSSSSSSSSSSSSSSS`);
			return config;
		});
	}

	get axios() {
		return this._axios;
	}
}
