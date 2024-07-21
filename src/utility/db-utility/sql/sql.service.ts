import { Model, Options, Sequelize } from "sequelize";
import { ISqlModels, ISqlService, SqlModelsType } from "../types";

export class SqlService<T extends SqlModelsType> {
	private modelsRef: T;
	public models: ISqlModels<T> = {} as ISqlModels<T>;

	private connectionString: string;
	private dialectOptions: Options;
	private dbConnectionRef: Sequelize;

	constructor(connectionString: string, models: T, dialectOptions?: Options) {
		this.connectionString = connectionString;
		this.dialectOptions = dialectOptions ?? {};
		this.modelsRef = models;
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
			console.log("Successfully Connected to Sequelize!!");
			return conn;
			// }
		} catch (e) {
			console.error("Error connecting to sequelize!!");
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
		return await this.dbConnectionRef.close();
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
) => new SqlService(connectionString, models, dialectOptions) as ISqlService<T>;
