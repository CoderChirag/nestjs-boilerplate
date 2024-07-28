import { CLASS_SERIALIZER_OPTIONS } from "@nestjs/common/serializer/class-serializer.constants";
import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { TodosServiceV2 } from "./todos.service";
import { GetAllTodosResDto } from "./todos.dto";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

@Reflect.metadata(CLASS_SERIALIZER_OPTIONS, { excludeExtraneousValues: true })
@ApiTags("Todos")
@Controller("v2/todos")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
export class TodosControllerV2 {
	constructor(private readonly todosService: TodosServiceV2) {}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get()
	@ApiOperation({ summary: "Get all todos" })
	@ApiResponse({
		status: 200,
		description: "Get all todos",
		type: GetAllTodosResDto,
	})
	async getAll() {
		const todos = await this.todosService.getAll();
		return todos.map((todo) => new TodoEntity(todo));
	}
}
