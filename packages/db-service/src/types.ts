import { Options as SequelizeOptions, Sequelize } from "sequelize";
import { SUPPORTED_DBS } from "./constants";
import { MongoService } from "./mongo/mongo-service";
import { SqlService } from "./sql/sql-service";
import {
	Model as MongooseModel,
	Schema as MongooseSchema,
	Document as MongooseDocument,
	ConnectOptions as MongooseConnectOptions,
} from "mongoose";
import { Agent } from "elastic-apm-node";
import { Logger } from "@repo/utility-types";

export type MongoSchemasType = Record<string, MongooseSchema>;
export type SqlModelsType = Record<string, (db: Sequelize) => any>;
export type IConfigModelsOrSchemas = MongoSchemasType | SqlModelsType;

export type MongoSchemaEntityType<S> =
	S extends MongooseSchema<infer T>
		? T extends MongooseDocument<any, any, infer K>
			? K
			: never
		: never;
export type IMongoModels<S> = {
	[K in keyof S]: MongooseModel<MongoSchemaEntityType<S[K]>>;
};
export type ISqlModels<T extends SqlModelsType> = {
	[K in keyof T]: ReturnType<T[K]>;
};

export interface MongoConnectOptions extends MongooseConnectOptions {
	connectTimeoutMS?: number;
	serverSelectionTimeoutMS?: number;
	poolSize?: number;
	keepAlive?: boolean;
}
export interface IMongoConfigOptions<S extends MongoSchemasType> {
	type: typeof SUPPORTED_DBS.MONGO_DB;
	connectionString: string;
	schemas: S;
	configOptions?: MongoConnectOptions;
	hooks?: (schemas: S) => void | Promise<void>;
	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}
export interface ISqlConfigOptions<M extends SqlModelsType> {
	type: typeof SUPPORTED_DBS.SQL;
	connectionString: string;
	models: M;
	dialectOptions?: SequelizeOptions;
	logger?: Logger;
	transactionLogger?: Logger;
	apm?: Agent;
}

export type IMongoService<S extends MongoSchemasType> = MongoService<S> & IMongoModels<S>;
export type ISqlService<T extends SqlModelsType> = SqlService<T> & ISqlModels<T>;

export type IDbInstance<
	T extends DB_TYPES,
	S extends IConfigModelsOrSchemas,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? S extends MongoSchemasType
		? IMongoService<S>
		: never
	: T extends typeof SUPPORTED_DBS.SQL
		? S extends SqlModelsType
			? ISqlService<S>
			: never
		: never;

export type IDBConfigOptions<
	T extends DB_TYPES,
	S extends IConfigModelsOrSchemas,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? S extends MongoSchemasType
		? IMongoConfigOptions<S>
		: never
	: T extends typeof SUPPORTED_DBS.SQL
		? S extends SqlModelsType
			? ISqlConfigOptions<S>
			: never
		: never;

export type DB_TYPES = (typeof SUPPORTED_DBS)[keyof typeof SUPPORTED_DBS];
