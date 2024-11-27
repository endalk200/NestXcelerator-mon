export interface IEnvironmentVariables {
  ENVIRONMENT: "development" | "production" | "local";
  APPLICATION_NAME: string;

  BCRYPT_SALT: number;
  JWT_AUDIENCE: string;
  JWT_ISSUER: string;
  PASSWORD_RESET_CODE_EXPIRATION_IN_MINUTES: number;
  VERIFICATION_CODE_EXPIRATION_IN_MINUTES: number;
  ACCESS_TOKEN_EXPIRATION_IN_HOURS: number;
  REFRESH_TOKEN_EXPIRATION_IN_HOURS: number;

  FROM_EMAIL: string;
  SUPPORT_EMAIL: string;
  RESEND_API_KEY: string;
}
