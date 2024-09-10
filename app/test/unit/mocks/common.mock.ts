import { Logger, Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { TodoStatus } from "src/constants";
import { WithMock } from "../types";

const moduleMocker = new ModuleMocker(global);

export const mockMongoTodo = {
	_id: "6697e3a1f5b9a1ea2793c5f6",
	title: "sd",
	description: "Do something",
	priority: 1,
	status: "Doing",
};

export const mockSqlTodo = {
	_id: 1,
	title: "test",
	description: "Do something serious",
	priority: 1,
	status: TodoStatus.DOING,
	createdAt: "2024-07-19T21:53:34.000Z",
	updatedAt: "2024-07-19T21:53:34.000Z",
};

const loggerMetadata = moduleMocker.getMetadata(Logger) as MockFunctionMetadata<
	ClassType<WithMock<Logger>>
>;
const MockLogger = moduleMocker.generateFromMetadata(loggerMetadata);
export const mockLoggerService = new MockLogger();
