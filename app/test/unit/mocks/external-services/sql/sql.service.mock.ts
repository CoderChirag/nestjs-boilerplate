import { Type as ClassType } from "@nestjs/common";
import { SqlService } from "db-service";
import { MockFunctionMetadata, ModuleMocker } from "jest-mock";
import { Model, Sequelize } from "sequelize";
import { MODELS } from "src/utility/models/sql";
import { WithMock } from "test/unit/types";

const moduleMocker = new ModuleMocker(global);

const mockMetadata = moduleMocker.getMetadata(SqlService) as MockFunctionMetadata<
	ClassType<WithMock<SqlService<typeof MODELS.todos>>>
>;
const Mock = moduleMocker.generateFromMetadata(mockMetadata);
const MockedService = new Mock();

const models = (Object.keys(MODELS.todos) as [keyof typeof MODELS.todos]).reduce(
	(acc, modelName) => {
		const sequelizeMetadata = moduleMocker.getMetadata(Sequelize)!;
		const SequelizeMock = moduleMocker.generateFromMetadata(sequelizeMetadata);
		const sequelizeMock = new SequelizeMock();

		const mockMetadata = moduleMocker.getMetadata(Model) as MockFunctionMetadata<
			WithMock<typeof Model>
		>;
		const MockedService = moduleMocker.generateFromMetadata(mockMetadata);
		acc[modelName] = MockedService;
		return acc;
	},
	{} as Record<keyof typeof MODELS.todos, WithMock<typeof Model>>,
);

(MockedService.models as any) = models;

const modelMetadata = moduleMocker.getMetadata(Model) as MockFunctionMetadata<
	ClassType<WithMock<Model>>
>;
const MockModel = moduleMocker.generateFromMetadata(modelMetadata);

export const MockSqlService = {
	...MockedService,
	...models,
};

export const mockSqlModel = new MockModel();
