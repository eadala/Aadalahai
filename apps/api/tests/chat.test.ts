import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("Chat & RAG API", () => {
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

  const legalDoc = {
    title: "نظام العمل السعودي",
    content:
      "المادة 77: للعامل الحق في إنهاء العقد دون مكافأة إذا ارتكب صاحب العمل مخالفة جسيمة. " +
      "المادة 80: يحق لصاحب العمل فسخ العقد دون مكافأة في حالات محددة تشمل الغياب المتكرر. " +
      "المادة 84: يستحق العامل مكافأة نهاية الخدمة عند انتهاء علاقة العمل.",
  };

  describe("Documents API", () => {
    it("should upload and index a document", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/documents",
        headers: authHeaders(),
        payload: legalDoc,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.document.title).toBe(legalDoc.title);
      expect(body.document.status).toBe("ready");
      expect(body.document.chunkCount).toBeGreaterThan(0);
    });

    it("should list user documents", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/documents",
        headers: authHeaders(),
        payload: legalDoc,
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/documents",
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().documents).toHaveLength(1);
    });

    it("should reject empty document", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/documents",
        headers: authHeaders(),
        payload: { title: "فارغ", content: "قصير" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Chat Sessions API", () => {
    it("should create a chat session", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: { title: "استشارة قانونية" },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.session.title).toBe("استشارة قانونية");
      expect(body.session.messages).toEqual([]);
    });

    it("should list sessions", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: {},
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().sessions.length).toBe(1);
    });

    it("should delete a session", async () => {
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: {},
      });
      const sessionId = createRes.json().session.id;

      const deleteRes = await app.inject({
        method: "DELETE",
        url: `/api/v1/chat/sessions/${sessionId}`,
        headers: authHeaders(),
      });
      expect(deleteRes.statusCode).toBe(200);

      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/chat/sessions/${sessionId}`,
        headers: authHeaders(),
      });
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe("Chat Messages (non-streaming)", () => {
    it("should send message and get RAG-powered response", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/documents",
        headers: authHeaders(),
        payload: legalDoc,
      });

      const sessionRes = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: {},
      });
      const sessionId = sessionRes.json().session.id;

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/chat/sessions/${sessionId}/messages`,
        headers: authHeaders(),
        payload: { content: "ما هي حقوق العامل عند إنهاء العقد؟", stream: false },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.userMessage.role).toBe("user");
      expect(body.assistantMessage.role).toBe("assistant");
      expect(body.assistantMessage.content.length).toBeGreaterThan(0);
    });

    it("should return session history with messages", async () => {
      const sessionRes = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: {},
      });
      const sessionId = sessionRes.json().session.id;

      await app.inject({
        method: "POST",
        url: `/api/v1/chat/sessions/${sessionId}/messages`,
        headers: authHeaders(),
        payload: { content: "مرحبا", stream: false },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/chat/sessions/${sessionId}`,
        headers: authHeaders(),
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().session.messages).toHaveLength(2);
    });
  });

  describe("Chat Messages (streaming)", () => {
    it("should stream SSE response", async () => {
      const sessionRes = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        headers: authHeaders(),
        payload: {},
      });
      const sessionId = sessionRes.json().session.id;

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/chat/sessions/${sessionId}/messages`,
        headers: authHeaders(),
        payload: { content: "ما هي المادة 77؟", stream: true },
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("text/event-stream");
      expect(response.body).toContain("data:");
      expect(response.body).toContain("[DONE]");
    });
  });

  describe("Authorization", () => {
    it("should reject unauthenticated chat requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/chat/sessions",
        payload: {},
      });
      expect(response.statusCode).toBe(401);
    });

    it("should reject unauthenticated document requests", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/documents",
        payload: legalDoc,
      });
      expect(response.statusCode).toBe(401);
    });
  });
});
