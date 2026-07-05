import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("User Profile API", () => {
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

  describe("GET /api/v1/users/me", () => {
    it("should return user profile", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users/me",
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.user.email).toBe("chat-test@example.com");
      expect(body.user.name).toBe("مستخدم تجريبي");
    });

    it("should reject unauthenticated request", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/users/me",
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("should update user name", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me",
        headers: authHeaders(),
        payload: { name: "محامي محدّث" },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user.name).toBe("محامي محدّث");
    });

    it("should reject short name", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/api/v1/users/me",
        headers: authHeaders(),
        payload: { name: "أ" },
      });
      expect(response.statusCode).toBe(400);
    });
  });
});
