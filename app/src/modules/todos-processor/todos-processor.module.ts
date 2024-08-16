import { Module } from "@nestjs/common";
import { TodosProcessorService } from "./todos-processor.service";

@Module({
	imports: [],
	providers: [TodosProcessorService],
	exports: [TodosProcessorService],
})
export class TodosProcessorModule {}
