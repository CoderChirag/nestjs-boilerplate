import { Options as SequelizeOptions, Sequelize } from "sequelize";
import { DB_TYPES, SUPPORTED_DBS } from "./constants";
import { MongoService, getMongoService } from "./mongo/mongo.service";
import { SqlService, getSqlService } from "./sql/sql.service";
import { Model as MongooseModel, Schema as MongooseSchema } from "mongoose";

export type MongoSchemasType = Record<string, MongooseSchema<any>>;
export type SqlModelsType = Record<string, (db: Sequelize) => any>;

export type MongoSchemaEntityType<S> = S extends MongooseSchema<infer T> ? T : never;
export type IMongoModels<S> = {
	[K in keyof S]: MongooseModel<MongoSchemaEntityType<S[K]>>;
};
export type ISqlModels<T extends SqlModelsType> = {
	[K in keyof T]: ReturnType<T[K]>;
};

export interface IMongoConfigOptions<S extends MongoSchemasType> {
	type: typeof SUPPORTED_DBS.MONGO_DB;
	connectionString: string;
	schemas: S;
}
export interface ISqlConfigOptions<M extends SqlModelsType> {
	type: typeof SUPPORTED_DBS.SQL;
	connectionString: string;
	models: M;
	dialectOptions?: SequelizeOptions;
}

export type IMongoService<S extends MongoSchemasType> = MongoService<S> & IMongoModels<S>;
export type ISqlService<T extends SqlModelsType> = SqlService<T> & ISqlModels<T>;

export type IDbInstance<
	T extends DB_TYPES,
	S extends MongoSchemasType | SqlModelsType,
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
	S extends MongoSchemasType | SqlModelsType,
> = T extends typeof SUPPORTED_DBS.MONGO_DB
	? S extends MongoSchemasType
		? IMongoConfigOptions<S>
		: never
	: T extends typeof SUPPORTED_DBS.SQL
		? S extends SqlModelsType
			? ISqlConfigOptions<S>
			: never
		: never;
