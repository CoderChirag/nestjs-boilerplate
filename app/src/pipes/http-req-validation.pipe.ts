import {
	ArgumentMetadata,
	Injectable,
	Optional,
	PipeTransform,
	ValidationPipe,
	ValidationPipeOptions,
} from "@nestjs/common";

@Injectable()
export class HttpReqValidationPipe<T> implements PipeTransform<T> {
	private readonly defaultOptions: ValidationPipeOptions = {
		transform: true,
		whitelist: true,
	};
	private readonly validator: ValidationPipe;

	constructor(
		@Optional() private readonly transformer?: (value: T, metadata: ArgumentMetadata) => T,
		@Optional() options?: ValidationPipeOptions,
	) {
		this.validator = new ValidationPipe({
			...this.defaultOptions,
			...(options ? options : {}),
		});
	}

	transform(value: T, metadata: ArgumentMetadata) {
		if (this.transformer) value = this.transformer(value, metadata);

		return this.validator.transform(value, metadata);
	}
}
