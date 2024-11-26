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
- [Prisma](https://github.com/prisma/prisma): Database ORM
- [ts-rest](https://github.com/ts-rest/ts-rest): Provides excellent developer experience by empowering you to build fuly type safe API endpoints utilizing api contracts
- [Postgres](https://github.com/postgres/postgres): a powerful, open source object-relational database system with over 35 years of active development that has earned
  it a strong reputation for reliability, feature robustness, and performance.
- [React Email](https://react.email/docs/introduction): For building email templates
- [Resend](https://resend.com): For sending emails

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

**General**

- [x] API
  - [x] Health check endpoints checking HTTP, memory health (rss and heap) and prisma database connection
  - [x] Open API spec v3 support and UI using swagger
  - [x] Typesafe API contract
  - [x] Client SDK supporting `fetch` and `react-query`
- [ ] Email integration
  - [x] Email template support using `react-email`
  - [x] Email service integration:
    - [x] Resend
    - [ ] SendGrid
    - [ ] MailGun
    - [ ] AWS SES
- [ ] File upload using uploadthing

**Database**

- [x] Database support
  - [x] Postgres
  - [ ] MySQL
- [x] ORM
  - [x] Prisma
  - [ ] Drizzle

**Security**

- [x] JWT based authentication. `accessToken` is secured by using `ES256` hashing via private public key pair.
      (`ES256` is an Elliptic Curve Digital Signature Algorithm (ECDSA) that uses the P-256 curve and SHA-256 hash function.)
- [x] Authentication guard verifying JWT expiration, issuer and audience for maximum security
- [x] Authorization guard that implements Role Based Access Conrtol (RBAC)
- [x] Securely stored password hashed using Blowfish cipher hashing algorithim.
- [x] Issued refresh token is unique to the device and is stored securely
- [x] Refresh token functionality while revoking used refresh token for one time use refresh tokens.
- [x] Active session management including revokation.
- [x] Rate limitter integration. Configured for:
  - [x] Email verification endpoint
  - [x] Password resent endpoint
- [x] Password reset functionality

**Deployment**

- [x] Production ready dockerfile
  - [x] Multi stage build for small docker image
  - [x] Health check mechanisim for monitoring
- [x] CI/CD

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contributing

We welcome contributions! Please fork the repository, create a feature branch, and submit a pull request.

## Maintainers

This module is maintained by [Endalkachew Biruk](https://github.com/endalk200).
