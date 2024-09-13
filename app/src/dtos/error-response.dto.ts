import { ApiProperty } from "@nestjs/swagger";
import { constants } from "src/constants";

export class BaseErrorResponseDto {
	success: false;
	error: {
		message: string;
		failures: any;
	};
}

export class InternalServerErrorResponseDto {
	@ApiProperty({
		type: "boolean",
		enum: [false],
		default: false,
		example: false,
	})
	success: false;

	@ApiProperty({
		type: "object",
		properties: {
			message: {
				type: "string",
				example: constants.HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR.MESSAGE,
			},
			failures: {
				oneOf: [
					{
						type: "object",
						additionalProperties: true,
						example: {},
					},
					{
						type: "array",
						items: {
							type: "object",
						},
						example: [],
					},
				],
				example: [],
			},
		},
	})
	error: {
		message: string;
		failures: any;
	};
}

export class ExternalDependencyFailureResponseDto {
	@ApiProperty({
		type: "boolean",
		enum: [false],
		default: false,
		example: false,
	})
	success: false;

	@ApiProperty({
		type: "object",
		properties: {
			message: {
				type: "string",
				example: constants.HTTP_RESPONSE_CODES.FAILED_DEPENDENCY.MESSAGE,
			},
			failures: {
				oneOf: [
					{
						type: "object",
						additionalProperties: true,
						example: {},
					},
					{
						type: "array",
						items: {
							type: "object",
						},
						example: [],
					},
				],
				example: [],
			},
		},
	})
	error: {
		message: string;
		failures: any;
	};
}
