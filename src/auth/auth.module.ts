import { Module } from "@nestjs/common";
import { PasswordService } from "./base/password.service";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule, JwtSecretRequestType } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";
import { TasksService } from "./tasks.service";
import { BaseAuthService } from "./base/auth.service.base";

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      global: true,
      secretOrKeyProvider: (requestType: JwtSecretRequestType) => {
        switch (requestType) {
          case JwtSecretRequestType.SIGN:
            return fs.readFileSync(
              path.join(__dirname, "../../ec-private.pem"),
            );
          case JwtSecretRequestType.VERIFY:
            return fs.readFileSync(path.join(__dirname, "../../ec-public.pem"));
          default:
            return "hard!to-guess_secret";
        }
      },
      signOptions: {
        algorithm: "ES256", // Use ES256 for elliptic curve signing
        expiresIn: "1h", // Token expiration time
      },
      verifyOptions: {
        algorithms: ["ES256"], // Ensure ES256 is used for verification
      },
    }),
  ],
  providers: [BaseAuthService, PasswordService, TasksService, AuthService],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}
