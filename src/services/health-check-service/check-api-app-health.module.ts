import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { CheckApiAppHealthController } from "./check-api-app-health.controller";
import { CheckApiAppHealthService } from "./check-api-app-health.service";
import { DBServicesModule } from "../db-services/db-services.module";

@Module({
	imports: [TerminusModule, DBServicesModule],
	controllers: [CheckApiAppHealthController],
	providers: [CheckApiAppHealthService],
})
export class CheckApiAppHealthModule {}
