# API Documentation

This document outline the API design and implementation workflow including frontend integration.

## API Design

The first step of any API development is the design phase. This kickstarter uses API contracts for the design phase. `ts-rest` is used for the API
contract implementation.

> !Note
> [`ts-rest`](https://ts-rest.com/) is framework for writing fully end to end type safe API contract, implementation and clients.

**1. Write your contract**

Checkout the following sample API contract.

```ts
{
  signup: {
    method: "POST",
    path: "/auth/signup",
    responses: {
      201: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        // ...
      }),
      400: z.object({
        message: z.string(),
      }),
      500: z.object({
        message: z.string(),
      }),
    },
    body: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
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
    summary: "Create a user account",
  },
}
```

## API Implementation

```ts
  @TsRestHandler(userContract.signup, {
    validateRequestBody: true,
    validateResponses: true,
  })
  async signup() {
    return tsRestHandler(userContract.signup, async ({ body }) => {
      const user = await this.service.createUser({
        firstName: body.firstName,
        lastName: body.lastName,
        // ...
      });

      return { status: 201, body: user };
    });
  }
```

`ts-rest` handles the request body, header, query and params validation by using the API contract specified. It can also validate the API response body, response codes.

## API Integration

```ts
import { contract } from "./contract";

const client = initClient(contract, {
  baseHeaders: {},
  baseUrl: "http://localhost:3000",
});

const createAccount = await client.signup({
  body: {
    firstName: "John",
    lastName: "Doe",
    // ....
  },
});
```

On the client import the contract and enjoy fully type safe SDK.

## API Documentation

The API contract you have written will automatically generate open API spec v3 compliant json file. It also integrates well with swagger UI.
Checkout the API documentation at http://localhost:3000/api
