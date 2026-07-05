import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("Document Analysis API", () => {
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

  async function uploadDocument() {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/documents",
      headers: authHeaders(),
      payload: {
        title: "عقد عمل",
        content: "البند 1: يلتزم الطرف الأول بدفع الراتب. البند 2: مدة العقد سنة واحدة.",
      },
    });
    return response.json().document.id as string;
  }

  it("POST /api/v1/documents/:id/analyze should return structured analysis", async () => {
    const docId = await uploadDocument();

    const response = await app.inject({
      method: "POST",
      url: `/api/v1/documents/${docId}/analyze`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.analysis.summary).toContain("ملخص تجريبي");
    expect(body.analysis.keyClauses.length).toBeGreaterThan(0);
    expect(body.analysis.risks.length).toBeGreaterThan(0);
    expect(body.analysis.recommendations.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/documents/:id/analyses should list analyses", async () => {
    const docId = await uploadDocument();

    await app.inject({
      method: "POST",
      url: `/api/v1/documents/${docId}/analyze`,
      headers: authHeaders(),
    });

    const response = await app.inject({
      method: "GET",
      url: `/api/v1/documents/${docId}/analyses`,
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.analyses).toHaveLength(1);
    expect(body.documentTitle).toBe("عقد عمل");
  });

  it("should reject analysis for non-ready document", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/documents/00000000-0000-0000-0000-000000000000/analyze",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(404);
  });
});
