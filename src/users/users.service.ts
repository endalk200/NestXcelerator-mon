import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { userContract } from "./contracts/users.contract";
import { TsRestException } from "@ts-rest/nest";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PasswordService } from "src/auth/password.service";

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
    try {
      const user = await this.prisma.user.create({
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
      });

      return user;
    } catch (error) {
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

      console.log(error);

      throw new TsRestException(userContract.signup, {
        status: 500,
        body: {
          code: "InternalServerError",
          message:
            "Something wen't wrong while trying to create a new user record",
        },
      });
    }
  }
}
