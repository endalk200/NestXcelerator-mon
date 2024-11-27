import { Module } from "@nestjs/common";
import { TsRestModule } from "@ts-rest/nest";
import { HealthModule } from "./health/health.module";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
    }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // miliseconds
        limit: 10, // Limit request within the ttl
      },
    ]),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot(),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
