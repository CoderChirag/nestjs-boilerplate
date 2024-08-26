import apm from "elastic-apm-node";
import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";

export class ConfigurationService<T extends object> {
	private _config: T;
	constructor(schema: ClassConstructor<T>, env: object, transformer: (env: object) => object) {
		const transformedEnv = transformer(env);
		this._config = plainToClass(schema, transformedEnv);
	}

	async validate() {
		const errors = await validate(this._config);
		if (errors.length > 0) {
			const err = new Error(
				`Validation failed: ${JSON.stringify(errors.map((e) => e.constraints))}`,
			);
			err.name = "ConfigValidationError";
			apm.captureError(err);
			throw err;
		}
	}

	get config() {
		return this._config;
	}
}
