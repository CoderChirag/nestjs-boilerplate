import { Injectable } from "@nestjs/common";
import { ITodoService } from "src/services/db-services/todo/todo.interface";
import { TodoRepository } from "src/services/db-services/todo/todo.repository";

@Injectable()
export class TodosService {
	private dbService: ITodoService;
	constructor(private readonly todoRepository: TodoRepository) {
		this.dbService = todoRepository.getSqlService();
	}

	async getAll() {
		const todos = await this.dbService.findAll();
		return todos;
	}
}
