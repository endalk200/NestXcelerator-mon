import { initContract } from "@ts-rest/core";

const c = initContract();

export const contract = c.router(
  {},
  {
    pathPrefix: "/api",
  },
);
