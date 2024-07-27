import { ApiProperty } from "@nestjs/swagger";
import { TodoStatus } from "src/constants";

export class TodoEntity {
	@ApiProperty({
		type: "number",
		example: 10,
		title: "Todo ID",
		description: "Unique identifier for the todo",
	})
	_id: number;
	@ApiProperty({
		type: "string",
		example: "Todo Title",
		title: "Todo Title",
		description: "Title of the todo",
	})
	title: string;
	@ApiProperty({
		type: "string",
		example: "Todo Description",
		title: "Todo Description",
		description: "Description of the todo",
	})
	description: string;
	@ApiProperty({
		type: "number",
		example: 1,
		title: "Todo Priority",
		description: "Priority of the todo",
	})
	priority: number;
	@ApiProperty({
		type: "enum",
		enum: TodoStatus,
		example: TodoStatus.DOING,
		title: "Todo Status",
		description: "Status of the todo",
	})
	status: TodoStatus;
}
