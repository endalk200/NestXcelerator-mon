import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthorizationGuard } from "./authorization.guard"; // Adjust the import path
import { IPermissionSchema as OriginalIPermissionSchema } from "./permissions";
import { Omit } from "@prisma/client/runtime/library";

type IPermissionSchema = Omit<OriginalIPermissionSchema, "roles">;

describe("AuthorizationGuard", () => {
  let guard: AuthorizationGuard;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Reflector, AuthorizationGuard],
    }).compile();

    guard = module.get<AuthorizationGuard>(AuthorizationGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockExecutionContext = (
    user: any,
    permissions: IPermissionSchema[],
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => {
        const handler = jest.fn();
        Reflect.defineMetadata("permissions", permissions, handler);
        return handler;
      },
      getClass: () => null,
    }) as unknown as ExecutionContext;

  it("should allow USER to read their own User resource", () => {
    const user = { role: "USER" };
    const permissions: IPermissionSchema[] = [
      { resource: "User", action: "read:own" },
    ];
    const context = mockExecutionContext(user, permissions);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should not allow USER to read their any User resource", () => {
    const user = { role: "USER" };
    const permissions: IPermissionSchema[] = [
      { resource: "User", action: "read:any" },
    ];
    const context = mockExecutionContext(user, permissions);

    expect(() => guard.canActivate(context)).toThrowError(
      new ForbiddenException(
        "User with role USER does not have permission to perform the requested action.",
      ),
    );
  });

  it("should allow ADMIN to read their own User resource", () => {
    const user = { role: "ADMIN" };
    const permissions: IPermissionSchema[] = [
      { resource: "User", action: "read:own" },
    ];
    const context = mockExecutionContext(user, permissions);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should not allow ADMIN to read any User resource", () => {
    const user = { role: "ADMIN" };
    const permissions: IPermissionSchema[] = [
      { resource: "User", action: "read:any" },
    ];
    const context = mockExecutionContext(user, permissions);

    expect(() => guard.canActivate(context)).toThrowError(
      new ForbiddenException(
        "User with role ADMIN does not have permission to perform the requested action.",
      ),
    );
  });

  it("should test not allow ADMIN to read any User resource", () => {
    const user = { role: "ADMIN" };
    const permissions: IPermissionSchema[] = [
      { resource: "User", action: "read:any" },
    ];
    const context = mockExecutionContext(user, permissions);

    expect(() => guard.canActivate(context)).toThrowError(
      new ForbiddenException(
        "User with role ADMIN does not have permission to perform the requested action.",
      ),
    );
  });
});
