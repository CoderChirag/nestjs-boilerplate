import { Injectable } from "@nestjs/common";
import { TodoRepository } from "./todo/todo.repository";

@Injectable()
export class DBServicesProvider {
	constructor(private readonly todoRepository: TodoRepository) {}

	async getConnectionStatus() {
		const results = await Promise.all([this.todoRepository.getConnectionStatus()]);

		return !results.includes(false);
	}
}
