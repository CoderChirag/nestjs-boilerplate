import {
	ConnectOptions,
	Connection,
	Schema,
	connections,
	createConnection,
	connect,
} from "mongoose";
import type { IMongoModels, IMongoService, MongoSchemasType } from "../types";
import { IDBService } from "../interfaces";
import { Agent } from "elastic-apm-node";
import { MongoServiceError } from "../exceptions/error";

export class MongoService<S extends Record<string, Schema<any>>> implements IDBService {
	private logger: any;
	private apm?: Agent;

	public schemas: S;
	public models: IMongoModels<S> = {} as IMongoModels<S>;

	private connectionString: string;
	private configOptions: ConnectOptions;
	private hooks: (schemas: S) => void | Promise<void>;
	private mongoConnectionRef: Connection;

	constructor(
		connectionString: string,
		schemas: S,
		configOptions?: ConnectOptions,
		hooks?: (schemas: S) => void | Promise<void>,
		logger?: any,
		apm?: Agent,
	) {
		this.connectionString = connectionString;
		this.schemas = schemas;
		this.configOptions = configOptions ?? {};
		this.hooks = hooks ?? (() => {});
		this.logger = logger ?? console;
		this.apm = apm;
	}

	async connect() {
		this.mongoConnectionRef = (
			await this.initiateConnection(this.connectionString, this.configOptions)
		).connection;
		await this.setupModels();
	}

	private async initiateConnection(connectionString: string, configOptions: ConnectOptions) {
		try {
			const conn = await connect(connectionString, configOptions);
			if (conn) {
				this.logger.log("Successfully connected to mongoose!!");
				return conn;
			}
		} catch (e) {
			const err = new MongoServiceError("Error connecting to mongoose!!", e);
			this.logger.error("Error connecting to mongoose!!");
			this.apm?.captureError(err);
			throw err;
		}
		throw new MongoServiceError("Error connecting to mongoose!!");
	}

	private async setupModels() {
		try {
			await this.hooks(this.schemas);
			for (const [modelName, model] of Object.entries(this.schemas)) {
				(this.models[modelName] as any) =
					this.mongoConnectionRef.model[modelName] ??
					this.mongoConnectionRef.model(modelName, model);
				this[modelName] = this.models[modelName];
			}
		} catch (e) {
			const err = new MongoServiceError("Error setting up models!!", e);
			this.logger.error("Error setting up models!!");
			this.apm?.captureError(err);
			throw err;
		}
	}

	async closeConnection() {
		try {
			await Promise.all(connections.map((conn) => conn.close()));
			this.logger.log("Mongoose connection closed!!");
		} catch (e) {
			const err = new MongoServiceError("Error closing mongoose connection!!", e);
			this.logger.error("Error closing mongoose connection!!");
			this.apm?.captureError(err);
			throw err;
		}
	}

	async isConnected() {
		return this.mongoConnectionRef.readyState === 1;
	}
}

export const getMongoService = <S extends MongoSchemasType>(
	connectionString: string,
	schemas: S,
	configOptions?: ConnectOptions,
	hooks?: (schemas: S) => void | Promise<void>,
	logger?: any,
	apm?: Agent,
) =>
	new MongoService(
		connectionString,
		schemas,
		configOptions,
		hooks,
		logger,
		apm,
	) as IMongoService<S>;
