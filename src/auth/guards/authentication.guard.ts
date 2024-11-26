import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from "@nestjs/jwt";
import { Request } from "express";
import { safeAwait } from "src/utils/safe-await";
import { JWTPayload } from "../auth.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const [payload, error] = await safeAwait(
        this.jwtService.verifyAsync<JWTPayload>(token),
      );
      if (error != null) {
        if (error instanceof TokenExpiredError) {
          this.logger.debug("Token is expired");
        } else if (error instanceof JsonWebTokenError) {
          this.logger.debug("Invalid token");
        } else if (error instanceof NotBeforeError) {
          this.logger.debug("Token is not active");
        } else {
          this.logger.debug("Failed to verify token");
        }
      }
      request["user"] = {
        ...payload,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}
