export interface IDBService {
	models: Record<string, unknown>;

	connect(): Promise<void>;
	closeConnection(): Promise<void>;
	isConnected(): boolean | Promise<boolean>;
	syncDb?(): Promise<unknown>;
}
