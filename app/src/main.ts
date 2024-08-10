import mongoose from "mongoose";
import { AppModule } from "./app.module";
import { QueueService } from "queue-service";

async function bootstrap() {
	await AppModule.init();
}
mongoose.set("debug", true);
bootstrap();
