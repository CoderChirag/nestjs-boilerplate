import {
	CreationOptional,
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize,
} from "sequelize";
import { TodoStatus } from "src/constants";

export class Todo extends Model<InferAttributes<Todo>, InferCreationAttributes<Todo>> {
	declare _id: CreationOptional<number>;
	declare title: string;
	declare description: string;
	declare priority: number;
	declare status: TodoStatus;
	declare readonly createdAt: string;
	declare readonly updatedAt: string;
}

export const TodoModel = (sequelize: Sequelize) => {
	Todo.init(
		{
			_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
			},
			priority: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: false,
				values: Object.values(TodoStatus),
				defaultValue: TodoStatus.TO_DO,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "todos",
			modelName: "todo",
		},
	);
	return Todo;
};
