import { DB_TYPES, SUPPORTED_DBS } from "./constants";
import { getMongoService } from "./mongo/mongo.service";
import { getSqlService } from "./sql/sql.service";
import type { IDBConfigOptions, IDbInstance, MongoSchemasType, SqlModelsType } from "./types";

export class DBService<T extends DB_TYPES, S extends MongoSchemasType | SqlModelsType> {
	private _db: IDbInstance<T, S>;

	constructor(config: IDBConfigOptions<T, S>) {
		const { type, connectionString } = config;
		switch (type) {
			case SUPPORTED_DBS.MONGO_DB:
				const { schemas } = config as IDBConfigOptions<
					typeof SUPPORTED_DBS.MONGO_DB,
					MongoSchemasType
				>;
				if (!schemas) {
					throw new Error("Schemas are required for MongoDB connection");
				}
				(this._db as any) = getMongoService(
					connectionString,
					schemas as S extends MongoSchemasType ? S : never,
				);
				break;
			case SUPPORTED_DBS.SQL:
				const { models, dialectOptions } = config as IDBConfigOptions<
					typeof SUPPORTED_DBS.SQL,
					SqlModelsType
				>;
				if (!models) {
					throw new Error("Models are required for SQL connection");
				}
				(this._db as any) = getSqlService(
					connectionString,
					models as S extends SqlModelsType ? S : never,
					dialectOptions,
				);
				break;
		}
	}

	getDbInstance() {
		return this._db;
	}
}
