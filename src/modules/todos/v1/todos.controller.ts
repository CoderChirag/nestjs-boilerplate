import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { TodosService } from "./todos.service";
import { GetAllTodosResDto } from "./todos.dto";

@ApiTags("Todos")
@Controller("v1/todos")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
export class TodosController {
	constructor(private readonly todosService: TodosService) {}

	@Get()
	@ApiOperation({ summary: "Get all todos" })
	@ApiResponse({
		status: 200,
		description: "Get all todos",
		type: GetAllTodosResDto,
	})
	async getAll() {
		return await this.todosService.getAll();
	}
}
