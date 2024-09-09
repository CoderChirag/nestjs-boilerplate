import { Type as ClassType } from "@nestjs/common";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { Model, model } from "mongoose";
import { SCHEMAS } from "src/utility/models/mongo";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const models = (Object.keys(SCHEMAS.todos) as [keyof typeof SCHEMAS.todos]).reduce(
	(acc, modelName) => {
		const mockMetadata = moduleMocker.getMetadata(
			model(modelName, SCHEMAS.todos[modelName]),
		) as MockFunctionMetadata<ClassType<WithMock<Model<any>>>, "function">;
		const Mock = moduleMocker.generateFromMetadata(mockMetadata);
		acc[modelName] = new Mock();
		const a = new Mock();
		return acc;
	},
	{} as Record<keyof typeof SCHEMAS.todos, WithMock<Model<any>>>,
);

export const MockMongoService = {
	models,
	...models,
	connect: jest.fn(),
	closeConnection: jest.fn(),
	isConnected: jest.fn(),
};
