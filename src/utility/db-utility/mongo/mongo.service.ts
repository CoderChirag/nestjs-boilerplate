import { Connection, Model, Schema, connections, createConnection } from "mongoose";
import type { MongoModels, MongoSchemasType } from "../types";

export class MongoService<S extends Record<string, Schema<any>>> {
	private schemas: S;
	public models: MongoModels<S> = {} as MongoModels<S>;

	private connectionString: string;
	private mongoConnectionRef: Connection;

	constructor(connectionString: string, schemas: S) {
		this.connectionString = connectionString;
		this.schemas = schemas;
	}

	async connect() {
		this.mongoConnectionRef = await this.initiateConnection(this.connectionString);
		this.setupModels();
	}

	private async initiateConnection(connectionString: string) {
		try {
			const conn = await createConnection(connectionString);
			if (conn) {
				console.log("Successfully connected to mongoose!!");
				return conn;
			}
		} catch (e) {
			console.error("Error connecting to mongoose!!");
			throw e;
		}
		throw new Error("Error connecting to mongoose!!");
	}

	private setupModels() {
		for (const [modelName, model] of Object.entries(this.schemas)) {
			(this.models[modelName] as any) =
				this.mongoConnectionRef.model[modelName] ?? this.mongoConnectionRef.model(modelName, model);
			this[modelName] = this.models[modelName];
		}
	}

	async closeConnection() {
		return Promise.all(connections.map((conn) => conn.close()));
	}

	async isConnected() {
		return this.mongoConnectionRef.readyState === 1;
	}
}

export const getMongoService = <S extends MongoSchemasType>(connectionString: string, schemas: S) =>
	new MongoService(connectionString, schemas) as MongoService<S> & MongoModels<S>;
