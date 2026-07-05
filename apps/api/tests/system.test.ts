import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createTestApp, cleanupTestDb } from "./helpers.js";

describe("System endpoints", () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await cleanupTestDb();
  });

  it("GET /health should return ok", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("adalah-api");
  });

  it("GET /ready should return ready with database check", async () => {
    const response = await app.inject({ method: "GET", url: "/ready" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ready");
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.llm.provider).toBe("mock");
    expect(body.checks.embedder.provider).toBe("mock");
  });

  it("GET /metrics should return 404 when disabled", async () => {
    const response = await app.inject({ method: "GET", url: "/metrics" });
    expect(response.statusCode).toBe(404);
  });
});
