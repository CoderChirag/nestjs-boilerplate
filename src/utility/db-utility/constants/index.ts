export const SUPPORTED_DBS = {
	MONGO_DB: "mongodb",
	SQL: "sql",
} as const;

export type DB_TYPES = (typeof SUPPORTED_DBS)[keyof typeof SUPPORTED_DBS];
