import { Model, Options, Sequelize } from "sequelize";
import { ISqlModels, ISqlService, SqlModelsType } from "../types";
import { IDBService } from "../interfaces";

export class SqlService<T extends SqlModelsType> implements IDBService {
	private logger: any;
	private modelsRef: T;
	public models: ISqlModels<T> = {} as ISqlModels<T>;

	private connectionString: string;
	private dialectOptions: Options;
	private dbConnectionRef: Sequelize;

	constructor(connectionString: string, models: T, dialectOptions?: Options, logger?: any) {
		this.connectionString = connectionString;
		this.dialectOptions = dialectOptions ?? {};
		this.modelsRef = models;
		this.logger = logger ?? console;
	}

	get sequelize() {
		return this.dbConnectionRef;
	}

	async connect() {
		this.dbConnectionRef = await this.initiateConnection(
			this.connectionString,
			this.dialectOptions,
		);
		this.setupModels();
	}

	private async initiateConnection(connectionString: string, dialectOptions: Options) {
		try {
			const conn = new Sequelize(connectionString, dialectOptions);
			this.logger.log("Successfully Connected to Sequelize!!");
			return conn;
			// }
		} catch (e) {
			this.logger.error("Error connecting to sequelize!!");
			throw e;
		}
	}

	private setupModels() {
		for (const [modelName, model] of Object.entries(this.modelsRef)) {
			(this.models[modelName] as any) = model(this.dbConnectionRef);
			this[modelName] = this.models[modelName];

			if (this[modelName].associate) {
				this[modelName].associate(this.models);
			}
		}
	}

	async isConnected() {
		try {
			await this.dbConnectionRef.authenticate();
			return true;
		} catch (e) {
			return false;
		}
	}

	async closeConnection() {
		await this.dbConnectionRef.close();
		this.logger.log("Sequelize connection closed!!");
	}

	async syncDb() {
		return await this.dbConnectionRef.sync();
	}

	fn() {
		return this.sequelize.fn;
	}
}

export const getSqlService = <T extends Record<string, (db: Sequelize) => Model<any, any>>>(
	connectionString: string,
	models: T,
	dialectOptions?: Options,
	logger?: any,
) => new SqlService(connectionString, models, dialectOptions, logger) as ISqlService<T>;
