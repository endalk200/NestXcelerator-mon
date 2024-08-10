import { NestFactory } from "@nestjs/core";
import { generateOpenApi } from "@ts-rest/open-api";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { contract } from "./api.contract";
import * as fs from "fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  const openApiDocument = generateOpenApi(
    contract,
    {
      info: {
        title: "Backend API",
        version: "1.0.0",
      },
    },
    {
      setOperationId: true,
    },
  );

  fs.writeFileSync(
    "./openapi/swagger.json",
    JSON.stringify(openApiDocument, null, 4),
  );

  SwaggerModule.setup("api", app, openApiDocument);

  await app.listen(3000);
}
bootstrap();
