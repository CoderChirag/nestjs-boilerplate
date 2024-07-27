import { ApiProperty } from "@nestjs/swagger";
import { TodoStatus } from "src/constants";

export class TodoEntity {
	@ApiProperty({ type: "string", example: "1", description: "The id of the todo" })
	_id: string | number;
	@ApiProperty({ type: "string", example: "Title", description: "The title of the todo" })
	title: string;
	@ApiProperty({
		type: "string",
		example: "Description",
		description: "The description of the todo",
	})
	description: string;
	@ApiProperty({ type: "number", example: 1, description: "The priority of the todo" })
	priority: number;
	@ApiProperty({
		enum: TodoStatus,
		example: TodoStatus.DOING,
		description: "The status of the todo",
	})
	status: TodoStatus;
}
