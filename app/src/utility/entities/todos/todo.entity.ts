import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { TodoStatus } from "src/constants";

export class TodoEntity {
	@Expose()
	@ApiProperty({ type: "string", example: "1", description: "The id of the todo" })
	_id: string | number;

	@Expose()
	@ApiProperty({ type: "string", example: "Title", description: "The title of the todo" })
	title: string;

	// @Expose()
	@ApiProperty({
		type: "string",
		example: "Description",
		description: "The description of the todo",
	})
	description: string;

	@Expose()
	@ApiProperty({ type: "number", example: 1, description: "The priority of the todo" })
	priority: number;

	@Expose()
	@ApiProperty({
		enum: TodoStatus,
		example: TodoStatus.DOING,
		description: "The status of the todo",
	})
	status: TodoStatus;

	@Expose()
	@ApiProperty({
		type: "string",
		required: false,
		example: "2021-09-09",
		description: "The creation date",
	})
	createdAt?: string;

	@Expose()
	@ApiProperty({
		type: "string",
		required: false,
		example: "2021-09-09",
		description: "The updation date",
	})
	updatedAt?: string;

	constructor(partial: Partial<TodoEntity>) {
		Object.assign(this, partial);
	}
}
