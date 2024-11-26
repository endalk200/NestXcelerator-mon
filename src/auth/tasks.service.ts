import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./base/password.service";
import { safeAwait } from "src/utils/safe-await";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleExpiredTokenCleanup() {
    this.logger.debug("Cleaning up expired refresh tokens");

    const [numberOfDeletedTokens, cleanRefreshTokenError] = await safeAwait(
      this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(), // Check if expiresAt is less than or equal to the current date and time
          },
        },
      }),
    );
    if (cleanRefreshTokenError != null) {
      this.logger.error(
        `Something went wrong while cleaning up expired sessions. ERROR: ${JSON.stringify(cleanRefreshTokenError)}`,
      );
    } else {
      this.logger.debug(
        `Cleaned ${numberOfDeletedTokens.count} expired sessions`,
      );
    }
  }
}
