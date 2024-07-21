import { Module } from "@nestjs/common";
import { HelloController } from "./hello.controller";
import { HelloService } from "./hello.service";
import { DBServicesModule } from "src/services/db-module/db.module";
import { constants } from "src/constants/constants";
import { DB_TYPES } from "src/utility/db-utility/constants";
import { SCHEMAS } from "src/utility/models/mongo";

@Module({
	controllers: [HelloController],
	providers: [HelloService],
})
export class HelloModule {}
