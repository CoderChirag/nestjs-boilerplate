import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { TodosServiceV2 } from "./todos.service";
import { GetAllTodosResDto } from "./todos.dto";

@ApiTags("Todos")
@Controller("v2/todos")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
export class TodosControllerV2 {
	constructor(private readonly todosService: TodosServiceV2) {}

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
