import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IPermissionSchema, permissionSchema } from "./permissions";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions: IPermissionSchema[] =
      this.reflector.get<IPermissionSchema[]>(
        "permissions",
        context.getHandler(),
      ) || [];

    const request = context.switchToHttp().getRequest();
    const user = request["user"]; // Ensure AuthenticationGuard sets this

    if (!user) {
      throw new UnauthorizedException("User not authenticated");
    }

    const hasAllPermissions = requiredPermissions.every(
      (requiredPermission) => {
        return permissionSchema.some((permission) => {
          return (
            permission.resource === requiredPermission.resource &&
            permission.action === requiredPermission.action &&
            permission.roles.includes(user.role) // Check if user's role is allowed
          );
        });
      },
    );

    if (!hasAllPermissions) {
      this.logger.error(
        `User with role ${user.role} does not have permission to perform this action.`,
        { requiredPermissions: requiredPermissions, role: user.role },
      );
      throw new ForbiddenException(
        `User with role ${user.role} does not have permission to perform this action.`,
      );
    }

    return true;
  }
}
