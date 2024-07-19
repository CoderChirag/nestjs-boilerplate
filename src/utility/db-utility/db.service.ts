import { DB_TYPES } from "./constants";
import { getMongoService } from "./mongo/mongo.service";
import { getSqlService } from "./sql/sql.service";
import type { DBConfigOptions, DbInstanceType, MongoSchemasType, SqlModelsType } from "./types";

export class DBService<T extends DB_TYPES, S extends MongoSchemasType, K extends SqlModelsType> {
	private _db: DbInstanceType<T, S, K>;

	constructor(config: DBConfigOptions<T, S, K>) {
		const { type, connectionString, schemas, models, dialectOptions } = config;
		switch (type) {
			case DB_TYPES.MONGO_DB:
				if (!schemas) {
					throw new Error("Schemas are required for MongoDB connection");
				}
				(this._db as any) = getMongoService(connectionString, schemas as S);
				break;
			case DB_TYPES.SQL:
				if (!models) {
					throw new Error("Models are required for SQL connection");
				}
				(this._db as any) = getSqlService(connectionString, models as K, dialectOptions);
				break;
		}
	}

	getDbInstance() {
		return this._db;
	}
}
