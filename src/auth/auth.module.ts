import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [ConfigModule],
  providers: [PasswordService, AuthService],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}
