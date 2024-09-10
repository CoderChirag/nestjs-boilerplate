import { MockedClass, ModuleMocker } from "jest-mock";
import { Model, model } from "mongoose";
import { SCHEMAS } from "src/utility/models/mongo";

const moduleMocker = new ModuleMocker(global);

const models = (Object.keys(SCHEMAS.todos) as [keyof typeof SCHEMAS.todos]).reduce(
	(acc, modelName) => {
		const mockMetadata = moduleMocker.getMetadata(model(modelName, SCHEMAS.todos[modelName]))!;
		const MockedService = moduleMocker.generateFromMetadata(mockMetadata);
		acc[modelName] = MockedService as unknown as MockedClass<Model<any>>;
		return acc;
	},
	{} as Record<keyof typeof SCHEMAS.todos, MockedClass<Model<any>>>,
);

export const MockMongoService = {
	models,
	...models,
	connect: jest.fn(),
	closeConnection: jest.fn(),
	isConnected: jest.fn(),
};
