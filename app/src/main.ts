import { AppModule } from "./app.module";

async function bootstrap() {
	await AppModule.init();
}
bootstrap();
