import { AppModule } from "./app.module";
import { ElasticApmModule } from "./services/elastic-apm/elastic.apm.module";

async function bootstrap() {
	await AppModule.init();
}
ElasticApmModule.init();
bootstrap();
