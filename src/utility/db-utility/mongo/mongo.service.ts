import { ConnectOptions, Connection, Schema, connections, createConnection } from "mongoose";
import type { IMongoModels, IMongoService, MongoSchemasType } from "../types";

export class MongoService<S extends Record<string, Schema<any>>> {
	private logger: any;

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
	) {
		this.connectionString = connectionString;
		this.schemas = schemas;
		this.configOptions = configOptions ?? {};
		this.hooks = hooks ?? (() => {});
		this.logger = logger ?? console;
	}

	async connect() {
		this.mongoConnectionRef = await this.initiateConnection(
			this.connectionString,
			this.configOptions,
		);
		this.setupModels();
	}

	private async initiateConnection(connectionString: string, configOptions: ConnectOptions) {
		try {
			const conn = await createConnection(connectionString, configOptions);
			if (conn) {
				this.logger.log("Successfully connected to mongoose!!");
				return conn;
			}
		} catch (e) {
			this.logger.error("Error connecting to mongoose!!");
			throw e;
		}
		throw new Error("Error connecting to mongoose!!");
	}

	private async setupModels() {
		await this.hooks(this.schemas);
		for (const [modelName, model] of Object.entries(this.schemas)) {
			(this.models[modelName] as any) =
				this.mongoConnectionRef.model[modelName] ?? this.mongoConnectionRef.model(modelName, model);
			this[modelName] = this.models[modelName];
		}
	}

	async closeConnection() {
		await Promise.all(connections.map((conn) => conn.close()));
		this.logger.log("Mongoose connection closed!!");
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
) => new MongoService(connectionString, schemas, configOptions, hooks, logger) as IMongoService<S>;
