import { Type as ClassType } from "@nestjs/common";
import { MongoService } from "db-service";
import { MockedClass, MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { Document, model, Model, Schema } from "mongoose";
import { SCHEMAS } from "src/utility/models/mongo";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const mockMetadata = moduleMocker.getMetadata(MongoService) as MockFunctionMetadata<
	ClassType<WithMock<MongoService<typeof SCHEMAS.todos>>>
>;
const Mock = moduleMocker.generateFromMetadata(mockMetadata);
const MockedService = new Mock();

const models = (Object.keys(SCHEMAS.todos) as [keyof typeof SCHEMAS.todos]).reduce(
	(acc, modelName) => {
		const mockMetadata = moduleMocker.getMetadata(model(modelName, SCHEMAS.todos[modelName]))!;
		const MockedService = moduleMocker.generateFromMetadata(mockMetadata);
		acc[modelName] = MockedService as unknown as MockedClass<Model<any>>;
		return acc;
	},
	{} as Record<keyof typeof SCHEMAS.todos, MockedClass<Model<any>>>,
);

const schemas = (Object.keys(SCHEMAS.todos) as [keyof typeof SCHEMAS.todos]).reduce(
	(acc, schemaName) => {
		const mockMetadata = moduleMocker.getMetadata(Schema)!;
		const Mock = moduleMocker.generateFromMetadata(mockMetadata);
		acc[schemaName] = Mock;
		return acc;
	},
	{} as Record<keyof typeof SCHEMAS.todos, MockedClass<typeof Schema>>,
);

(MockedService.models as any) = models;
(MockedService.schemas as any) = schemas;

const modelMetadata = moduleMocker.getMetadata(Document) as MockFunctionMetadata<
	ClassType<WithMock<Document>>
>;
const MockModel = moduleMocker.generateFromMetadata(modelMetadata);

export const MockMongoService = {
	...MockedService,
	...models,
};

export const mockMongoModel = new MockModel();
