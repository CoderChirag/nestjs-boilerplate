import apm from "elastic-apm-node";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { constants } from "./constants/constants";
import { NestFactory } from "@nestjs/core";
import { ApiAppModule } from "./apps/api/api-app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { PubSubProcessorModule } from "./apps/pub-sub-processor/pub-sub-processor.module";

export class AppModule {
	static async init() {
		let app: INestApplication | null = null;
		const { INFRA } = constants;

		switch (process.env.APP_NAME) {
			case INFRA.APP_NAMES.API_APP:
				app = await NestFactory.create(ApiAppModule, { bufferLogs: true });
				app.enableCors();
				app.enableShutdownHooks();
				app.setGlobalPrefix("/api");
				const config = new DocumentBuilder()
					.setTitle(constants.SWAGGER.TITLE)
					.setDescription(constants.SWAGGER.DESCRIPTION)
					.setVersion(constants.SWAGGER.VERSION)
					.build();

				const document = SwaggerModule.createDocument(app, config);

				SwaggerModule.setup(constants.SWAGGER.DOCUMENTATION_PATH, app, document, {
					jsonDocumentUrl: constants.SWAGGER.JSON_DOCUMENTATION_PATH,
				});
				break;
			case INFRA.APP_NAMES.CONSUMER_APP:
				app = await NestFactory.create(PubSubProcessorModule, { bufferLogs: true });
				app.enableShutdownHooks();
			default:
				break;
		}

		if (app) {
			await app.listen(process.env.PORT!);
			apm.logger.info("App Started on Port: " + process.env.PORT);
		}
	}
}
