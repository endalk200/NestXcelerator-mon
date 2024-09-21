import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);
const c = initContract();

export const authContract = c.router(
  {
    login: {
      method: "POST",
      path: "/login",
      responses: {
        200: z.object({
          auth: z.object({
            token: z.string(),
          }),
          user: z.object({
            id: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            email: z.string(),
            isEmailVerified: z.boolean(),
            isActive: z.boolean(),
          }),
        }),
        400: z.object({
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        423: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
      body: z.object({
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8)
          .regex(
            /(?=.*[A-Z])/,
            "Password must contain at least one uppercase letter",
          )
          .regex(/(?=.*\d)/, "Password must contain at least one number")
          .regex(
            /(?=.*[!@#$%^&*(),.?":{}|<>])/,
            "Password must contain at least one special character",
          )
          .min(8, "Password must be at least 8 characters long"),
      }),
      summary: "Login",
    },
    me: {
      method: "GET",
      path: "/me",
      responses: {
        200: z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
          isEmailVerified: z.boolean(),
          isActive: z.boolean(),
        }),
        401: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        }),
      },
      headers: z.object({
        authorization: z.string(),
      }),
      summary: "Get current user information",
    },
  },
  {
    pathPrefix: "auth",
  },
);
