import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TsRestException } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";

@Injectable()
export class AuthService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
  ) {}

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new TsRestException(authContract.login, {
        status: 400,
        body: {
          code: "InvalidCredentials",
          message:
            "Invalid credentials provided, please try again with correct credentials.",
        },
      });
    }

    if (await this.passwordService.compare(data.password, user.password)) {
      return user;
    }

    throw new TsRestException(authContract.login, {
      status: 400,
      body: {
        code: "InvalidCredentials",
        message:
          "Invalid credentials provided, please try again with correct credentials.",
      },
    });
  }
}
