import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("Analytics API", () => {
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

  it("GET /api/v1/analytics/me should return user stats", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/me",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.analytics.totalSessions).toBe(0);
    expect(body.analytics.role).toBe("user");
    expect(body.analytics.onboardingCompleted).toBe(false);
  });

  it("should reflect activity after chat and documents", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/documents",
      headers: authHeaders(),
      payload: {
        title: "نظام",
        content: "المادة 1: نص قانوني تجريبي للاختبار.",
      },
    });

    const sessionRes = await app.inject({
      method: "POST",
      url: "/api/v1/chat/sessions",
      headers: authHeaders(),
      payload: { title: "جلسة" },
    });
    const sessionId = sessionRes.json().session.id;

    await app.inject({
      method: "POST",
      url: `/api/v1/chat/sessions/${sessionId}/messages`,
      headers: authHeaders(),
      payload: { content: "سؤال", stream: false },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/me",
      headers: authHeaders(),
    });

    const { analytics } = response.json();
    expect(analytics.totalSessions).toBe(1);
    expect(analytics.totalMessages).toBeGreaterThanOrEqual(2);
    expect(analytics.totalDocuments).toBe(1);
  });
});
