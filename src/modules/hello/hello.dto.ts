import { ApiProperty } from "@nestjs/swagger";
import { HttpResponseDto } from "src/dtos/http-response.dto";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

export class GetTodosFromMongoDto implements HttpResponseDto {
	@ApiProperty()
	success: true;
	@ApiProperty({ type: TodoEntity, isArray: true })
	data: TodoEntity[];
}

export class GetTodosFromSqlDto implements HttpResponseDto {
	@ApiProperty()
	success: true;
	@ApiProperty({ type: TodoEntity, isArray: true })
	data: TodoEntity[];
}
