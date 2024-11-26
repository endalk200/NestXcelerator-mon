import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BaseAuthService {
  constructor(protected readonly prisma: PrismaService) {}

  generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
  }
}
