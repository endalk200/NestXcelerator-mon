import { Module } from "@nestjs/common";
import { TsRestModule } from "@ts-rest/nest";
import { HealthModule } from "./health/health.module";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    TsRestModule.register({
      isGlobal: true,
      jsonQuery: true,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
