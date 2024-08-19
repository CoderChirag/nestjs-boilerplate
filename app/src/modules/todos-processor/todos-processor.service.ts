import { Injectable, Logger } from "@nestjs/common";
import { IKafkaMessageProcessorMessageArg } from "queue-service";
import { TodoEntity } from "src/utility/entities/todos/todo.entity";

@Injectable()
export class TodosProcessorService {
	readonly logger = new Logger(TodosProcessorService.name);

	async processTodos(message: IKafkaMessageProcessorMessageArg<TodoEntity>, logger: Logger) {
		const { key, value, headers } = message;
		logger.log(`Message Headers: ${JSON.stringify(headers, null, 2)}`);
		logger.log(`Message Key: ${key}`);
		logger.log(`Message Value: ${JSON.stringify(value, null, 2)}`);
		logger.log(
			message.value._id,
			message.value.title,
			message.value.description,
			message.value.priority,
			message.value.status,
		);
	}
}
