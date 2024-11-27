import { NestFactory } from "@nestjs/core";
import { generateOpenApi } from "@ts-rest/open-api";
import { SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { contract } from "./api.contract";
import * as fs from "fs";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { IEnvironmentVariables } from "./environmentVariables";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService =
    app.get<ConfigService<IEnvironmentVariables>>(ConfigService);

  app.setGlobalPrefix("api");
  app.enableShutdownHooks();
  if (configService.get("ENVIRONMENT", { infer: true }!) != "local") {
    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
  }

  const openApiDocument = generateOpenApi(
    contract,
    {
      info: {
        title: `${configService.get("APPLICATION_NAME", { infer: true }!)} API Doc`,
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
