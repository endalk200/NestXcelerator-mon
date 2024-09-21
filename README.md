# NestXcelerator

Welcome to NestXcelerator, a powerful and flexible NestJS starter template designed to kickstart your backend monolith projects.
NestXcelerator provides a solid foundation equipped with all the essential features and best practices to ensure scalability, maintainability, and developer happiness.

## Motivation

> [!NOTE]
> Internal Developer Platforms (IDPs) are tools that help teams within a company build and manage software more easily.
> Think of them as a one-stop shop for developers, providing everything they need to write, test, and deploy their applications.
> IDPs automate many tasks, making it faster and simpler for developers to work without getting bogged down in complicated processes.
> This boosts productivity and helps teams deliver better software more consistently.

The concept of [internal developer platform (IDP)](https://internaldeveloperplatform.org/) is something I am really interested in for a while. This projects is meant to server as template for an IDP I'm building.
This template project will be used in the IDP to quickly kickstart backend projects with sensible defaults and best practices thus boosting developer productivity.

## Technologies

- [Typescript](https://github.com/microsoft/TypeScript): Offers type safety when building backend APIs in nodejs
- [NestJs](https://github.com/nestjs/nest): Provides best in class developer experience building backend APIs using nodejs
- [Prisma](https://github.com/prisma/prisma)
- [ts-rest](https://github.com/ts-rest/ts-rest): Provides excellent developer experience by empowering you to build fuly type safe API endpoints utilizing api contracts
- [Postgres](https://github.com/postgres/postgres): a powerful, open source object-relational database system with over 35 years of active development that has earned
  it a strong reputation for reliability, feature robustness, and performance.

## Getting Started

Install all dependencies

```bash
npm install
```

In order for the authentication endpoints to work, generate public/private key pair which will be used for generating and verifying JWTs.

```bash
# Generate private key using P-256 curve
openssl ecparam -genkey -name prime256v1 -noout -out ec-private.pem

# Generate corresponding public key
openssl ec -in ec-private.pem -pubout -out ec-public.pem
```

## Features

- [x] Database support
  - [x] Postgres
- [x] Health check endpoint
  - [x] Http health check
  - [x] Memory health check (rss and heap)
  - [x] Prisma database connection
- [ ] User management
  - [x] Create user account and store password as hash
- [x] Auth
  - [x] Login endpoint
  - [x] Auth guard
