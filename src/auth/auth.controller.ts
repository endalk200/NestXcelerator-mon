import { Controller, Req, UseGuards } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { authContract } from "./contracts/auth.contract";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { Request } from "express";

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

  @TsRestHandler(authContract.me, {
    validateRequestBody: true,
    validateResponses: true,
  })
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    return tsRestHandler(authContract.me, async ({}) => {
      const me = await this.service.me(req["user"]["sub"]);

      return { status: 200, body: me };
    });
  }
}
