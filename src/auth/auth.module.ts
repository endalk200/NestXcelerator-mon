import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      global: true,
      privateKey: fs.readFileSync(path.join(__dirname, "../../ec-private.pem")),
      publicKey: fs.readFileSync(path.join(__dirname, "../../ec-public.pem")),
      signOptions: {
        algorithm: "ES256", // Use ES256 for elliptic curve signing
        expiresIn: "1h", // Token expiration time
      },
      verifyOptions: {
        algorithms: ["ES256"], // Ensure ES256 is used for verification
      },
    }),
  ],
  providers: [PasswordService, AuthService],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}
