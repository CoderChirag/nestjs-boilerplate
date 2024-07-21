import { Module } from "@nestjs/common";
import { HelloController } from "./hello.controller";
import { HelloService } from "./hello.service";
import { DBServicesModule } from "src/services/db-services/db-services.module";

@Module({
	imports: [DBServicesModule],
	controllers: [HelloController],
	providers: [HelloService],
})
export class HelloModule {}
