import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { HttpModule } from "@nestjs/axios";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    TerminusModule.forRoot({
      errorLogStyle: "pretty",
    }),
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
