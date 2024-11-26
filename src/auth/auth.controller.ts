import { Controller, Req, UseGuards } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";
import { AuthService } from "./auth.service";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { Request } from "express";
import { Permissions } from "./rbac/permissions.decorator";
import { AuthorizationGuard } from "./guards/authorization.guard";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @TsRestHandler(authContract.login, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async login(@Req() req: Request) {
    return tsRestHandler(authContract.login, async ({ body }) => {
      const auth = await this.service.login({
        userAgent: req.headers["user-agent"],
        email: body.email,
        password: body.password,
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.refreshToken, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async refreshToken(@Req() req: Request) {
    return tsRestHandler(authContract.refreshToken, async ({ headers }) => {
      const auth = await this.service.refreshToken({
        userAgent: req.headers["user-agent"],
        refreshToken: headers["x-refresh-token"],
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.logout, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "RefreshToken",
    action: "delete:own",
  })
  async logout(@Req() req: Request) {
    return tsRestHandler(authContract.logout, async ({ headers }) => {
      const auth = await this.service.logout({
        userId: req["user"]["sub"],
        deviceId: headers["x-device-id"],
        refreshToken: headers["x-refresh-token"],
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.sendVerificationCode, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async sendVerificationCode() {
    return tsRestHandler(
      authContract.sendVerificationCode,
      async ({ body }) => {
        const auth = await this.service.sendEmailVerificationCode({
          email: body.email,
        });

        return { status: 200, body: auth };
      },
    );
  }

  @TsRestHandler(authContract.verifyEmail, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 2000 } })
  async verifyEmail() {
    return tsRestHandler(authContract.verifyEmail, async ({ body }) => {
      const auth = await this.service.verifyEmail({
        verificationId: body.verificationId,
        verificationCode: body.verificationCode,
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.forgotPassword, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async forgotPassword() {
    return tsRestHandler(authContract.forgotPassword, async ({ body }) => {
      const auth = await this.service.sendPasswordResetCode({
        email: body.email,
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.resetPassword, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async resetPassword() {
    return tsRestHandler(authContract.resetPassword, async ({ body }) => {
      const auth = await this.service.resetPassword({
        resetId: body.resetId,
        resetCode: body.resetCode,
        password: body.password,
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.me, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "User",
    action: "read:own",
  })
  async me(@Req() req: Request) {
    return tsRestHandler(authContract.me, async ({}) => {
      const me = await this.service.me(req["user"]["sub"]);

      return { status: 200, body: me };
    });
  }

  @TsRestHandler(authContract.currentSessions, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "RefreshToken",
    action: "read:own",
  })
  async getActiveSessions(@Req() req: Request) {
    return tsRestHandler(authContract.currentSessions, async ({}) => {
      const sessions = await this.service.getCurrentActiveSessions(
        req["user"]["sub"],
      );

      return { status: 200, body: sessions };
    });
  }

  @TsRestHandler(authContract.revokeSession, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "RefreshToken",
    action: "delete:own",
  })
  async revokeSession(@Req() req: Request) {
    return tsRestHandler(authContract.revokeSession, async ({ params }) => {
      const auth = await this.service.revokeSession({
        userId: req["user"]["sub"],
        sessionId: params.sessionId,
      });

      return { status: 200, body: auth };
    });
  }

  @TsRestHandler(authContract.changePassword, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "User",
    action: "update:own",
  })
  async changePassword(@Req() req: Request) {
    return tsRestHandler(authContract.changePassword, async ({ body }) => {
      const response = await this.service.changePassword({
        userId: req["user"]["sub"],
        newPassword: body.newPassword,
      });

      return {
        status: 200,
        body: response,
      };
    });
  }
}
