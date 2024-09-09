import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { userContract } from "./contracts/users.contract";
import { TsRestException } from "@ts-rest/nest";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PasswordService } from "src/auth/password.service";
import { safeAwait } from "src/utils/safe-await";

@Injectable()
export class UsersService {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly passwordService: PasswordService,
  ) {}

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const [user, error] = await safeAwait(
      this.prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: await this.passwordService.hash(data.password),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,

          email: true,
          isEmailVerified: true,
          isActive: true,

          createdAt: true,
          updatedAt: true,
        },
      }),
    );
    if (error != null) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new TsRestException(userContract.signup, {
          status: 400,
          body: {
            code: "UserAlreadySignedUp",
            message: "User has already signed up",
          },
        });
      }

      throw new TsRestException(userContract.signup, {
        status: 500,
        body: {
          code: "InternalServerError",
          message:
            "Something wen't wrong while trying to create a new user record",
        },
      });
    }

    return user;
  }
}
