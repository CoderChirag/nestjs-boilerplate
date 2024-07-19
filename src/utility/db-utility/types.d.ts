import { Options, Sequelize } from "sequelize";
import { DB_TYPES } from "./constants";
import { getMongoService } from "./mongo/mongo.service";
import { getSqlService } from "./sql/sql.service";
import { Model, Schema } from "mongoose";

export type MongoSchemasType = Record<string, Schema<any>>;

export type SqlModelsType = Record<string, (db: Sequelize) => any>;

export type DbInstanceType<
	T extends DB_TYPES,
	S extends MongoSchemasType,
	K extends SqlModelsType,
> = T extends DB_TYPES.MONGO_DB
	? ReturnType<typeof getMongoService<S>>
	: T extends DB_TYPES.SQL
		? ReturnType<typeof getSqlService<K>>
		: never;

export interface DBConfigOptions<
	T extends DB_TYPES,
	S extends MongoSchemasType,
	K extends SqlModelsType,
> {
	type: T;
	connectionString: string;
	schemas?: S;
	dialectOptions?: T extends DB_TYPES.SQL ? Options : never;
	models?: K;
}

export type MongoSchemaEntityType<S> = S extends Schema<infer T> ? T : never;

export type MongoModels<S> = {
	[K in keyof S]: Model<MongoSchemaEntityType<S[K]>>;
};

export type SqlModels<T extends SqlModelsType> = {
	[K in keyof T]: ReturnType<T[K]>;
};
