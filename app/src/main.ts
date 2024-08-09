import mongoose from "mongoose";
import { AppModule } from "./app.module";

async function bootstrap() {
	await AppModule.init();
}
mongoose.set("debug", true);
bootstrap();
