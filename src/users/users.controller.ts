import { Controller, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { userContract } from "./contracts/users.contract";
import { Permissions } from "src/auth/rbac/permissions.decorator";
import { AuthorizationGuard } from "src/auth/guards/authorization.guard";
import { AuthenticationGuard } from "src/auth/guards/authentication.guard";

@Controller()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @TsRestHandler(userContract.signup, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async signup() {
    return tsRestHandler(userContract.signup, async ({ body }) => {
      const user = await this.service.createUser({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
      });

      return { status: 201, body: user };
    });
  }

  @TsRestHandler(userContract.changeUserInfo, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permissions({
    resource: "User",
    action: "update:own",
  })
  async changeUserInfo(@Req() req: Request) {
    return tsRestHandler(userContract.changeUserInfo, async ({ body }) => {
      const response = await this.service.changeUserInfo({
        userId: req["user"]["sub"],
        firstName: body.firstName,
        lastName: body.lastName,
      });

      return {
        status: 200,
        body: response,
      };
    });
  }
}
