import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { IEnvironmentVariables } from "src/environmentVariables";

export type Salt = string | number;

const BCRYPT_SALT_VAR = "BCRYPT_SALT";
const UNDEFINED_SALT_OR_ROUNDS_ERROR = `${BCRYPT_SALT_VAR} is not defined`;
const SALT_OR_ROUNDS_TYPE_ERROR = `${BCRYPT_SALT_VAR} must be a positive integer or text`;

@Injectable()
export class PasswordService {
  salt: Salt;

  constructor(private configService: ConfigService<IEnvironmentVariables>) {
    const saltOrRounds = this.configService.get(BCRYPT_SALT_VAR);
    this.salt = parseSalt(saltOrRounds);
  }

  compare(password: string, encrypted: string): Promise<boolean> {
    return compare(password, encrypted);
  }

  hash(password: string): Promise<string> {
    return hash(password, this.salt);
  }
}

export function parseSalt(value: string | undefined): Salt {
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
