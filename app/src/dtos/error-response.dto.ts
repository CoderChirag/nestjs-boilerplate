import { ApiProperty } from "@nestjs/swagger";

export class BaseErrorResponseDto {
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
				example: "Something went wrong",
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
