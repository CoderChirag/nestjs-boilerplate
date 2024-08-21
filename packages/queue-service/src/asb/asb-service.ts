import { ServiceBusClient } from "@azure/service-bus";
import { Logger } from "@repo/utility-types";
import { Agent } from "elastic-apm-node";
import { IASBServiceConfig } from "..";
import { ASBServiceError } from "../exceptions/asb";
import { ASBProducerService } from ".";

export class ASBService {
	private readonly _client;
	private readonly _apm?: Agent;
	private readonly _logger: Logger;

	private readonly _producer: ASBProducerService;

	constructor(config: IASBServiceConfig) {
		const { logger, apm } = config;
		this._apm = apm;
		this._logger = logger ?? console;

		if ("connectionString" in config) this._client = new ServiceBusClient(config.connectionString);
		else if ("namespace" in config)
			this._client = new ServiceBusClient(config.namespace, config.credential);
		else {
			const err = new ASBServiceError("Invalid ASB Service Config");
			this._logger.error(err.message);
			this._apm?.captureError(err);
			throw err;
		}

		this._producer = new ASBProducerService(this._client, this._logger, this._apm);
		this._logger.log("ASBService Successfully initialized");
	}

	get producer() {
		return this._producer;
	}
}
