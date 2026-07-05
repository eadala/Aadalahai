import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("Legal Search API", () => {
  let app: FastifyInstance;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    const user = await registerTestUser(app);
    accessToken = user.accessToken;
  });

  const authHeaders = () => ({ authorization: `Bearer ${accessToken}` });

  async function seedDocument() {
    await app.inject({
      method: "POST",
      url: "/api/v1/documents",
      headers: authHeaders(),
      payload: {
        title: "نظام العمل",
        content: "المادة 77: يحق للعامل الحصول على إجازة سنوية مدفوعة الأجر.",
      },
    });
  }

  it("GET /api/v1/search should return hybrid results", async () => {
    await seedDocument();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=إجازة",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.query).toBe("إجازة");
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].excerpt).toContain("إجازة");
  });

  it("should search legislation corpus without user documents", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=محامٍ&scope=legislation",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.scope).toBe("legislation");
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].source).toBe("legislation");
    expect(body.results[0].documentTitle).toContain("الإجراءات الجزائية");
  });

  it("should reject short queries", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=a",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(400);
  });

  it("should return empty user results when no documents match", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/search?q=xyznomatch123&scope=user",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().scope).toBe("user");
    expect(response.json().results).toEqual([]);
  });
});
