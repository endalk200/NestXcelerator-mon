import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  describe("Create a new user (e2e)", () => {
    it("/api/auth/signup (GET)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/signup")
        .send({
          firstName: "John",
          lastName: "Doe",
          email: "email@example.com",
          password: "assd",
        })
        .expect(400)
        .expect({
          data: { bodyResult: { issues: [] } },
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
