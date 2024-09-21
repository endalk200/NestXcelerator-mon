import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TsRestException } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";
import { safeAwait } from "src/utils/safe-await";
import { JwtService } from "@nestjs/jwt";

export type JWTPayload = {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async login(data: { email: string; password: string }) {
    const [user, error] = await safeAwait(
      this.prisma.user.findUniqueOrThrow({
        where: {
          email: data.email,
        },
      }),
    );
    if (error != null) {
      this.logger.error(
        `User table db query failed. ERROR: ${JSON.stringify(error)}`,
      );
      throw new TsRestException(authContract.me, {
        status: 401,
        body: {
          message: "Unauthorized",
        },
      });
    }

    if (!user.isActive) {
      this.logger.debug(
        `User: isActive: ${user.isActive} isEmailVerified: ${user.isEmailVerified}`,
      );
      throw new TsRestException(authContract.login, {
        status: 423,
        body: {
          message: `The account is not active, ${!user.isEmailVerified ? "Please verify your email address" : "Please contact admin"} to activate your account`,
        },
      });
    }

    if (await this.passwordService.compare(data.password, user.password)) {
      const payload = {
        sub: user.id,
        iss: "backend",
        aud: "backend",
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        auth: {
          token: accessToken,
        },
        user: user,
      };
    }

    throw new TsRestException(authContract.login, {
      status: 400,
      body: {
        message:
          "Invalid credentials provided, please try again with correct credentials.",
      },
    });
  }

  async me(userId: string) {
    const [user, error] = await safeAwait(
      this.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isEmailVerified: true,
          isActive: true,
        },
      }),
    );
    if (error != null) {
      this.logger.error(
        `User table db query with id [${userId}] failed. ERROR: ${JSON.stringify(error)}`,
      );
      throw new TsRestException(authContract.me, {
        status: 401,
        body: {
          message: "Unauthorized",
        },
      });
    }

    return user;
  }
}
