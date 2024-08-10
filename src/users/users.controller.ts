import { Controller } from "@nestjs/common";
import { UsersService } from "./users.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { userContract } from "./contracts/users.contract";

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
}
