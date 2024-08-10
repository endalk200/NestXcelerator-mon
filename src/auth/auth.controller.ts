import { Controller } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @TsRestHandler(authContract.login, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async login() {
    return tsRestHandler(authContract.login, async ({ body }) => {
      const auth = await this.service.login({
        email: body.email,
        password: body.password,
      });

      return { status: 200, body: auth };
    });
  }
}
