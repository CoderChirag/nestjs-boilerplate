import { ApiResponseProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
	@ApiResponseProperty({
		type: Boolean,
		example: false,
	})
	success: false;

	@ApiResponseProperty({
		type: Object,
		example: {
			message: "Resource not found",
			failures: {},
		},
	})
	error: {
		message: string;
		failures: any;
	};
}
