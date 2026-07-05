import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, registerTestUser } from "./helpers.js";

describe("Legislation Corpus API", () => {
  let app: FastifyInstance;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
    const user = await registerTestUser(app);
    accessToken = user.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const authHeaders = () => ({ authorization: `Bearer ${accessToken}` });

  it("GET /api/v1/legislation should list seeded sources", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/legislation",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.count).toBeGreaterThanOrEqual(2);
    expect(body.sources.some((s: { title: string }) => s.title.includes("نظام العمل"))).toBe(
      true
    );
  });
});
