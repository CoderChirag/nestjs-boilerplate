import { Controller, Get } from "@nestjs/common";
import { HelloService } from "./hello.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BaseErrorResponseDto } from "src/dtos/error-response.dto";
import { GetTodosFromMongoDto, GetTodosFromSqlDto } from "./hello.dto";
import { Todo } from "src/utility/models/mongo/todos/todo.schema";

@ApiTags("Hello")
@ApiResponse({
	status: 500,
	type: BaseErrorResponseDto,
})
@Controller()
export class HelloController {
	constructor(private readonly helloService: HelloService) {}

	@Get()
	@ApiOperation({ summary: "Get data from MongoDb" })
	@ApiResponse({
		status: 200,
		description: "Data from MongoDb",
		type: GetTodosFromMongoDto,
	})
	async getHello(): Promise<Todo[]> {
		return await this.helloService.getTodosFromMongo();
	}
	@Get("sql")
	@ApiOperation({ summary: "Get data from SQL" })
	@ApiResponse({
		status: 200,
		description: "Data from SQL",
		type: GetTodosFromSqlDto,
	})
	async getH() {
		return await this.helloService.getTodosFromSql();
	}
}
