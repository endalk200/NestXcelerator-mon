import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./base/password.service";
import { TsRestException } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";
import { safeAwait } from "src/utils/safe-await";
import { JwtService } from "@nestjs/jwt";
import { IEnvironmentVariables } from "src/environmentVariables";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { VerificationCodeTemplate } from "src/transactional/emails/email-verification";
import { PasswordResetCodeTemplate } from "src/transactional/emails/password-reset";
import { v4 as uuidv4 } from "uuid";
import { BaseAuthService } from "./base/auth.service.base";

export type JWTPayload = {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  role: string;
};

@Injectable()
export class AuthService extends BaseAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
    private jwtService: JwtService,
    private configService: ConfigService<IEnvironmentVariables>,
  ) {
    super(prisma);
  }

  async generateRefreshToken(data: {
    userId: string;
    deviceId: string;
    deviceName: string;
  }): Promise<string> {
    const token = uuidv4(); // Generate a random secure token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set expiry to 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: token,
        expiresAt: expiresAt,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
      },
    });

    return token;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken || new Date() > refreshToken.expiresAt) {
      throw new Error("Invalid or expired refresh token");
    }

    return refreshToken.userId;
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async login(data: { email: string; password: string; userAgent: string }) {
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
      const JWT_ISSUER = this.configService.get("JWT_ISSUER", {
        infer: true,
      })!;
      const JWT_AUDIENCE = this.configService.get("JWT_AUDIENCE", {
        infer: true,
      })!;
      const ACCESS_TOKEN_EXPIRATION_IN_HOURS = this.configService.get(
        "ACCESS_TOKEN_EXPIRATION_IN_HOURS",
        {
          infer: true,
        },
      )!;
      const REFRESH_TOKEN_EXPIRATION_IN_HOURS = this.configService.get(
        "REFRESH_TOKEN_EXPIRATION_IN_HOURS",
        {
          infer: true,
        },
      )!;

      const deviceId = uuidv4();
      const deviceName = data.userAgent;

      const payload = {
        sub: user.id,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.generateRefreshToken({
        userId: user.id,
        deviceId: deviceId,
        deviceName: deviceName,
      });

      return {
        auth: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          deviceId: deviceId,
          deviceName: deviceName,
          accessTokenExpiresIn: ACCESS_TOKEN_EXPIRATION_IN_HOURS.toString(),
          refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRATION_IN_HOURS.toString(),
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

  async refreshToken(data: { refreshToken: string; userAgent: string }) {
    const [refreshTokenRecord, refreshTokenRecordError] = await safeAwait(
      this.prisma.refreshToken.findUniqueOrThrow({
        where: {
          token: data.refreshToken,
        },
        include: {
          user: true,
        },
      }),
    );
    if (refreshTokenRecordError != null) {
      this.logger.error(
        `RefreshToken table db query failed. ERROR: ${JSON.stringify(refreshTokenRecordError)}`,
      );
      throw new TsRestException(authContract.me, {
        status: 401,
        body: {
          message: "Unauthorized",
        },
      });
    }

    if (!refreshTokenRecord.user.isActive) {
      this.logger.debug(
        `User: isActive: ${refreshTokenRecord.user.isActive} isEmailVerified: ${refreshTokenRecord.user.isEmailVerified}`,
      );
      throw new TsRestException(authContract.login, {
        status: 423,
        body: {
          message: `The account is not active, ${!refreshTokenRecord.user.isActive ? "Please verify your email address" : "Please contact admin"} to activate your account`,
        },
      });
    }

    if (await this.validateRefreshToken(data.refreshToken)) {
      const JWT_ISSUER = this.configService.get("JWT_ISSUER", {
        infer: true,
      })!;
      const JWT_AUDIENCE = this.configService.get("JWT_AUDIENCE", {
        infer: true,
      })!;
      const ACCESS_TOKEN_EXPIRATION_IN_HOURS = this.configService.get(
        "ACCESS_TOKEN_EXPIRATION_IN_HOURS",
        {
          infer: true,
        },
      )!;
      const REFRESH_TOKEN_EXPIRATION_IN_HOURS = this.configService.get(
        "REFRESH_TOKEN_EXPIRATION_IN_HOURS",
        {
          infer: true,
        },
      )!;

      const payload = {
        sub: refreshTokenRecord.user.id,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE,
        role: refreshTokenRecord.user.role,
      };

      const deviceId = uuidv4();
      const deviceName = data.userAgent;

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = await this.generateRefreshToken({
        userId: refreshTokenRecord.user.id,
        deviceId: deviceId,
        deviceName: deviceName,
      });

      const [, revokeOldTokenError] = await safeAwait(
        this.prisma.refreshToken.delete({
          where: {
            id: refreshTokenRecord.id,
          },
        }),
      );
      if (revokeOldTokenError != null) {
        this.logger.error(
          `RefreshToken table db query failed. ERROR: ${JSON.stringify(revokeOldTokenError)}`,
        );
      }

      return {
        auth: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          deviceId: deviceId,
          deviceName: deviceName,
          accessTokenExpiresIn: ACCESS_TOKEN_EXPIRATION_IN_HOURS.toString(),
          refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRATION_IN_HOURS.toString(),
        },
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

  async logout(data: {
    userId: string;
    refreshToken: string;
    deviceId: string;
  }) {
    const [refreshTokenRecord, refreshTokenRecordError] = await safeAwait(
      this.prisma.refreshToken.deleteMany({
        where: {
          deviceId: data.deviceId,
          user: {
            id: data.userId,
          },
        },
      }),
    );
    if (refreshTokenRecordError != null) {
      this.logger.error(
        `RefreshToken table db query failed. ERROR: ${JSON.stringify(refreshTokenRecordError)}`,
      );
      throw new TsRestException(authContract.me, {
        status: 401,
        body: {
          message: "Unauthorized",
        },
      });
    }

    console.log(refreshTokenRecord);

    return {
      message: "successfully logged out",
    };
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
          role: true,
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

  async getCurrentActiveSessions(userId: string) {
    const [user, error] = await safeAwait(
      this.prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          refreshToken: true,
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

    const sessions = user.refreshToken.map((token) => ({
      id: token.id,
      deviceName: token.deviceName,
      deviceId: token.deviceId,
      createdAt: token.createdAt,
    }));

    return sessions;
  }

  async sendEmailVerificationCode(data: { email: string }) {
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
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 404,
        body: {
          message: "Account not found",
        },
      });
    }

    if (user.isEmailVerified) {
      this.logger.error(
        `Account associated with email ${data.email} is already verified`,
      );
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 400,
        body: {
          message: "The account is already verified",
        },
      });
    }

    const verificationCode = this.generateSixDigitCode();
    const expiresAt = new Date(
      Date.now() +
        this.configService.get("VERIFICATION_CODE_EXPIRATION_IN_HOURS", {
          infer: true,
          default: 15,
        })! *
          60 *
          1000,
    ); // Convert hours into seconds

    const [verification, verificationRecordError] = await safeAwait(
      this.prisma.emailVerification.create({
        data: {
          userId: user.id,
          code: verificationCode,
          expiresAt: expiresAt,
        },
      }),
    );
    if (verificationRecordError != null) {
      console.log(verificationRecordError);
    }

    const resend = new Resend(
      this.configService.get("RESEND_API_KEY", { infer: true })!,
    );

    resend.emails.send({
      from: this.configService.getOrThrow("FROM_EMAIL", { infer: true })!,
      to: data.email,
      subject: "Verify your email",
      react: VerificationCodeTemplate({
        applicationName: this.configService.get("APPLICATION_NAME", {
          infer: true,
        })!,
        code: verificationCode,
        supportEmail: this.configService.get("SUPPORT_EMAIL", { infer: true })!,
        expirationInMinutes: this.configService
          .get("PASSWORD_RESET_CODE_EXPIRATION_IN_MINUTES", {
            infer: true,
            default: 15,
          })
          .toString(),
      }),
    });

    return {
      verificationId: verification.id,
      message: "Email with the verification code has been sent to your email.",
    };
  }

  async verifyEmail(data: {
    verificationId: string;
    verificationCode: string;
  }) {
    const [verificationRecord, verificationRecordError] = await safeAwait(
      this.prisma.emailVerification.findUniqueOrThrow({
        where: {
          id: data.verificationId,
        },
        include: {
          user: {
            select: {
              id: true,
              isEmailVerified: true,
              isActive: true,
            },
          },
        },
      }),
    );
    if (verificationRecordError != null) {
      this.logger.error(
        `VerificationCode table db query failed. ERROR: ${JSON.stringify(verificationRecordError)}`,
      );
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 404,
        body: {
          message: "No verification record was found",
        },
      });
    }

    if (verificationRecord.user.isEmailVerified) {
      this.logger.error(`This account is already verified`);
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 400,
        body: {
          message: "The account is already verified",
        },
      });
    }

    if (data.verificationCode !== verificationRecord.code) {
      this.logger.error(`Verification code mismatch`);
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 400,
        body: {
          message: "The provided verification code does not match",
        },
      });
    }

    const currentTime = new Date(); // Get the current time

    if (currentTime > verificationRecord.expiresAt) {
      this.logger.error(`Verification code has expired`);
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 400,
        body: {
          message: "Verification code has expired",
        },
      });
    }

    const [, updateUserRecordError] = await safeAwait(
      this.prisma.user.update({
        where: {
          id: verificationRecord.user.id,
        },
        data: {
          isActive: true,
          isEmailVerified: true,
        },
      }),
    );
    if (updateUserRecordError != null) {
      this.logger.error(
        `Something went wrong while updating verification status. ERROR: ${JSON.stringify(verificationRecordError)}`,
      );
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 500,
        body: {
          message: "Something went wrong while verifying your email",
        },
      });
    }

    return { message: "Verification successfull" };
  }

  async sendPasswordResetCode(data: { email: string }) {
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
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 404,
        body: {
          message: "Account not found",
        },
      });
    }

    const resetCode = this.generateSixDigitCode();
    const expiresAt = new Date(
      Date.now() +
        this.configService.get("PASSWORD_RESET_CODE_EXPIRATION_IN_MINUTES", {
          infer: true,
          default: 15,
        })! *
          60 *
          1000,
    ); // Convert hours into seconds

    const [resetRecord, resetRecordError] = await safeAwait(
      this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          code: resetCode,
          expiresAt: expiresAt,
        },
      }),
    );
    if (resetRecordError != null) {
      console.log(resetRecordError);
    }

    const resend = new Resend(
      this.configService.get("RESEND_API_KEY", { infer: true })!,
    );

    resend.emails.send({
      from: this.configService.getOrThrow("FROM_EMAIL", { infer: true })!,
      to: data.email,
      subject: "Password reset code",
      react: PasswordResetCodeTemplate({
        applicationName: this.configService.get("APPLICATION_NAME", {
          infer: true,
        })!,
        code: resetCode,
        supportEmail: this.configService.get("SUPPORT_EMAIL", { infer: true })!,
        expirationInMinutes: this.configService
          .get("PASSWORD_RESET_CODE_EXPIRATION_IN_MINUTES", {
            infer: true,
            default: 15,
          })
          .toString(),
      }),
    });

    return {
      resetId: resetRecord.id,
      message: "Email with the reset code has been sent to your email.",
    };
  }

  async resetPassword(data: {
    resetId: string;
    resetCode: string;
    password: string;
  }) {
    const [resetRecord, resetRecordError] = await safeAwait(
      this.prisma.passwordReset.findUniqueOrThrow({
        where: {
          id: data.resetId,
        },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      }),
    );
    if (resetRecordError != null) {
      this.logger.error(
        `PasswordReset table db query failed. ERROR: ${JSON.stringify(resetRecordError)}`,
      );
      throw new TsRestException(authContract.sendVerificationCode, {
        status: 404,
        body: {
          message: "No password reset record was found",
        },
      });
    }

    if (data.resetCode !== resetRecord.code) {
      this.logger.error(`Verification code mismatch`);
      throw new TsRestException(authContract.resetPassword, {
        status: 400,
        body: {
          message: "The provided reset code does not match",
        },
      });
    }

    const currentTime = new Date(); // Get the current time

    if (currentTime > resetRecord.expiresAt) {
      this.logger.error(`Reset code has expired`);
      throw new TsRestException(authContract.resetPassword, {
        status: 400,
        body: {
          message: "Reset code has expired",
        },
      });
    }

    const [, updateUserRecordError] = await safeAwait(
      this.prisma.user.update({
        where: {
          id: resetRecord.user.id,
        },
        data: {
          password: await this.passwordService.hash(data.password),
        },
      }),
    );
    if (updateUserRecordError != null) {
      this.logger.error(
        `Something went wrong while updating user password. ERROR: ${JSON.stringify(updateUserRecordError)}`,
      );
      throw new TsRestException(authContract.resetPassword, {
        status: 500,
        body: {
          message: "Something went wrong while trying to update user password",
        },
      });
    }

    return { message: "Password reset successfull" };
  }

  async changePassword(data: { userId: string; newPassword: string }) {
    const [, updateUserRecordError] = await safeAwait(
      this.prisma.user.update({
        where: {
          id: data.userId,
        },
        data: {
          password: await this.passwordService.hash(data.newPassword),
        },
      }),
    );
    if (updateUserRecordError != null) {
      this.logger.error(
        `Something went wrong while updating user password. ERROR: ${JSON.stringify(updateUserRecordError)}`,
      );
      throw new TsRestException(authContract.resetPassword, {
        status: 500,
        body: {
          message: "Something went wrong while trying to update user password",
        },
      });
    }

    return { message: "Password changed successfully" };
  }

  async revokeSession(data: { userId: string; sessionId: string }) {
    const [refreshTokenRecord, refreshTokenRecordError] = await safeAwait(
      this.prisma.refreshToken.delete({
        where: {
          id: data.sessionId,
          user: {
            id: data.userId,
          },
        },
      }),
    );
    if (refreshTokenRecordError != null) {
      this.logger.error(
        `RefreshToken table db query failed. ERROR: ${JSON.stringify(refreshTokenRecordError)}`,
      );
      throw new TsRestException(authContract.me, {
        status: 401,
        body: {
          message: "Unauthorized",
        },
      });
    }

    console.log(refreshTokenRecord);

    return {
      message: "successfully revoked session",
    };
  }
}
