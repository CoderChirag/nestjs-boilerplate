import { ApiProperty } from "@nestjs/swagger";
import { HttpResponseDto } from "src/dtos/http-response.dto";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

export class GetAllTodosResDto extends HttpResponseDto {
	@ApiProperty({ type: [TodoEntity] })
	data: TodoEntity[];
}
