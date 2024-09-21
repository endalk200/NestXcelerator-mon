import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { IEnvironmentVariables } from "../environmentVariables";

export type Salt = string | number;

const UNDEFINED_SALT_OR_ROUNDS_ERROR = `BCRYPT_SALT is not defined`;
const SALT_OR_ROUNDS_TYPE_ERROR = `BCRYPT_SALT must be a positive integer or text`;

@Injectable()
export class PasswordService {
  salt: Salt;

  constructor(private configService: ConfigService<IEnvironmentVariables>) {}

  compare(password: string, encrypted: string): Promise<boolean> {
    return compare(password, encrypted);
  }

  hash(password: string): Promise<string> {
    const salt = parseSalt(
      this.configService.get("BCRYPT_SALT", {
        infer: true,
      })!,
    );

    return hash(password, salt);
  }
}

export function parseSalt(value: string | number | undefined): Salt {
  if (value === undefined) {
    throw new Error(UNDEFINED_SALT_OR_ROUNDS_ERROR);
  }

  const rounds = Number(value);

  if (Number.isNaN(rounds)) {
    return value;
  }
  if (!Number.isInteger(rounds) || rounds < 0) {
    throw new Error(SALT_OR_ROUNDS_TYPE_ERROR);
  }
  return rounds;
}
