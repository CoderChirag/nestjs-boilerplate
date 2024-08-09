import mongoose from "mongoose";
import { AppModule } from "./app.module";
import { ElasticApmModule } from "./services/elastic-apm/elastic.apm.module";

async function bootstrap() {
	await AppModule.init();
}
mongoose.set("debug", true);
ElasticApmModule.init();
bootstrap();
