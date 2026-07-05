import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdalahClient, AdalahApiError } from "../src/index.js";
import type { TokenStorage } from "../src/types.js";

function createMockStorage(): TokenStorage & { tokens: { access: string | null; refresh: string | null } } {
  const store = { access: "test-token" as string | null, refresh: "refresh-token" as string | null };
  return {
    tokens: store,
    getAccessToken: () => store.access,
    getRefreshToken: () => store.refresh,
    setTokens: (a, r) => {
      store.access = a;
      store.refresh = r;
    },
    clearTokens: () => {
      store.access = null;
      store.refresh = null;
    },
  };
}

describe("AdalahClient", () => {
  const mockFetch = vi.fn();
  let client: AdalahClient;
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockFetch.mockReset();
    storage = createMockStorage();
    client = new AdalahClient({
      baseUrl: "http://localhost:3001",
      storage,
      fetch: mockFetch,
    });
  });

  it("should call health endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok", service: "adalah-api" }),
    });

    const result = await client.health.check();
    expect(result.status).toBe("ok");
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/health",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should call ready endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: "ready",
        service: "adalah-api",
        checks: { database: { status: "ok" } },
        timestamp: "2026-07-05T00:00:00.000Z",
      }),
    });

    const result = await client.system.ready();
    expect(result.status).toBe("ready");
  });

  it("should login without auth header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: "1", email: "a@b.com", name: "Test", role: "user", createdAt: "" },
        tokens: { accessToken: "at", refreshToken: "rt", expiresIn: "15m" },
      }),
    });

    const result = await client.auth.login("a@b.com", "SecurePass1");
    expect(result.tokens.accessToken).toBe("at");

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("should attach bearer token for authenticated requests", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ sessions: [] }),
    });

    await client.chat.listSessions();

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
  });

  it("should throw AdalahApiError on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: { code: "VALIDATION_ERROR", message: "بيانات غير صالحة", details: [] },
      }),
    });

    await expect(client.auth.login("bad", "x")).rejects.toThrow(AdalahApiError);
  });

  it("should set tokens via storage", () => {
    client.setTokens({ accessToken: "new-at", refreshToken: "new-rt", expiresIn: "15m" });
    expect(storage.getAccessToken()).toBe("new-at");
    expect(storage.getRefreshToken()).toBe("new-rt");
  });

  it("should use bound fetch when no custom fetch is provided", async () => {
    const boundClient = new AdalahClient({ baseUrl: "http://localhost:3001" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok", service: "adalah-api" }),
    } as Response);

    await boundClient.health.check();

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:3001/health",
      expect.objectContaining({ method: "GET" })
    );
    fetchSpy.mockRestore();
  });

  it("should analyze document", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        analysis: {
          id: "a1",
          documentId: "d1",
          documentTitle: "عقد",
          summary: "ملخص",
          keyClauses: [],
          risks: [],
          recommendations: [],
          createdAt: "2026-07-05T00:00:00.000Z",
        },
      }),
    });

    const result = await client.documents.analyze("d1");
    expect(result.analysis.summary).toBe("ملخص");
    expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/documents/d1/analyze");
  });

  it("should list document analyses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        documentId: "d1",
        documentTitle: "عقد",
        analyses: [],
      }),
    });

    const result = await client.documents.listAnalyses("d1");
    expect(result.analyses).toEqual([]);
  });

  it("should search documents", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        query: "إجازة",
        count: 1,
        results: [
          {
            chunkId: "c1",
            documentId: "d1",
            documentTitle: "نظام",
            excerpt: "إجازة سنوية",
            score: 0.8,
            matchType: "hybrid",
          },
        ],
      }),
    });

    const result = await client.search.query("إجازة", { scope: "legislation" });
    expect(result.count).toBeGreaterThanOrEqual(0);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/search?q=");
  });

  it("should list legislation sources", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ count: 2, sources: [{ id: "1", title: "نظام", category: "عمل", jurisdiction: "السعودية", createdAt: "" }] }),
    });

    const result = await client.legislation.list();
    expect(result.count).toBe(2);
  });
});
