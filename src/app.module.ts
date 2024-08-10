import { Module } from "@nestjs/common";
import { TsRestModule } from "@ts-rest/nest";
import { HealthModule } from "./health/health.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
    }),
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
