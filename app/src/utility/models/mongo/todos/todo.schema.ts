import { TodoStatus } from "src/constants";
import { Schema as NestSchema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Schema } from "mongoose";

@NestSchema()
export class Todo {
	@Prop({ required: true, type: Schema.Types.ObjectId })
	_id: string;
	@Prop({ required: true })
	title: string;
	@Prop({ required: true })
	description: string;
	@Prop({ required: true, default: 0 })
	priority: number;
	@Prop({ required: true, default: TodoStatus.DOING, enum: TodoStatus })
	status: string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
