import { ApiProperty } from "@nestjs/swagger";
import { HttpResponseDto } from "src/dtos/http-response.dto";
import { Todo } from "src/utility/models/mongo/todos/todo.schema";

export class GetTodosFromMongoDto implements HttpResponseDto {
	@ApiProperty()
	success: true;
	@ApiProperty({ type: Todo, isArray: true })
	data: Todo[];
}

export class GetTodosFromSqlDto implements HttpResponseDto {
	@ApiProperty()
	success: true;
	@ApiProperty({ type: Todo, isArray: true })
	data: Todo[];
}
