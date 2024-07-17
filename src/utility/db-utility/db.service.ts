import { Schema } from "mongoose";
import { DB_TYPES } from "./constants";
import { getMongoService } from "./mongo/mongo.service";

export interface DBConfigOptions<T extends DB_TYPES, S extends Record<string, Schema<any>>> {
	type: T;
	connectionString: string;
	schemas: T extends DB_TYPES.MONGO_DB ? S : never;
}

export class DBService<T extends DB_TYPES, S extends Record<string, Schema<any>>> {
	private _db: T extends DB_TYPES.MONGO_DB ? ReturnType<typeof getMongoService<S>> : never;

	constructor(config: DBConfigOptions<T, S>) {
		const { type, connectionString, schemas } = config;
		switch (type) {
			case DB_TYPES.MONGO_DB:
				(this._db as any) = getMongoService(connectionString, schemas as S);
		}
	}

	getDbInstance() {
		return this._db;
	}
}
