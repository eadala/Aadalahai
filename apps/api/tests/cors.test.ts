import { describe, it, expect } from "vitest";
import { resolveCorsOrigin } from "../src/config/env.js";
import type { Env } from "../src/config/env.js";

const base: Env = {
  DATABASE_URL: "postgresql://adalah:adalah_dev@localhost:5432/adalah",
  JWT_SECRET: "test-secret-key-minimum-32-characters-long",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_DAYS: 7,
  PORT: 3001,
  HOST: "0.0.0.0",
  NODE_ENV: "production",
  LLM_PROVIDER: "mock",
  OPENAI_MODEL: "gpt-4o-mini",
  OPENAI_EMBEDDING_MODEL: "text-embedding-3-small",
  OPENAI_TIMEOUT_MS: 30_000,
  OPENAI_MAX_RETRIES: 2,
  EMBEDDER_PROVIDER: "mock",
  EMBEDDING_DIMENSIONS: 384,
  RAG_TOP_K: 5,
  RAG_CHUNK_SIZE: 500,
  RAG_CHUNK_OVERLAP: 50,
  METRICS_ENABLED: false,
};

describe("resolveCorsOrigin", () => {
  it("should allow all origins when CORS_ORIGINS is empty", () => {
    expect(resolveCorsOrigin(base)).toBe(true);
  });

  it("should parse comma-separated origins", () => {
    const result = resolveCorsOrigin({
      ...base,
      CORS_ORIGINS: "https://adalah.com, https://www.adalah.com",
    });
    expect(result).toEqual(["https://adalah.com", "https://www.adalah.com"]);
  });
});
