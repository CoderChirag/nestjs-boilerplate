import { Module } from "@nestjs/common";
import { HelloController } from "src/modules/hello/hello.controller";
import { HelloModule } from "src/modules/hello/hello.module";

@Module({
	imports: [HelloModule],
})
export class ApiAppModule {}
