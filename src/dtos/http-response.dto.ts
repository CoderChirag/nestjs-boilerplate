import { ApiProperty } from "@nestjs/swagger";

export class HttpResponseDto {
	@ApiProperty({
		type: "boolean",
		enum: [true],
		default: true,
		example: true,
	})
	success: true;

	@ApiProperty()
	data: any;
}
