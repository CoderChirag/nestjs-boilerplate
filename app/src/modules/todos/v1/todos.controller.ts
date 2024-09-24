import {
	ClassSerializerInterceptor,
	Controller,
	Get,
	UseInterceptors,
	UsePipes,
} from "@nestjs/common";
import { CLASS_SERIALIZER_OPTIONS } from "@nestjs/common/serializer/class-serializer.constants";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { TodosService } from "./todos.service";
import { GetAllTodosResDto } from "./todos.dto";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";
import { HttpReqValidationPipe } from "src/pipes/http-req-validation.pipe";

@Reflect.metadata(CLASS_SERIALIZER_OPTIONS, { excludeExtraneousValues: true })
@ApiTags("Todos")
@UsePipes(HttpReqValidationPipe)
@Controller("v1/todos")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@UseInterceptors(ClassSerializerInterceptor)
	@Get()
	@ApiOperation({ summary: "Get all todos" })
	@ApiResponse({
		status: 200,
		description: "Get all todos",
		type: GetAllTodosResDto,
	})
	async getAll(): Promise<TodoEntity[]> {
		const todos = await this.todosService.getAll();
		return todos.map((todo) => new TodoEntity(todo));
	}
}
