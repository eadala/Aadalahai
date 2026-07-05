import { describe, it, expect } from "vitest";
import { createAIProviders } from "../src/ai/factory.js";
import type { Env } from "../src/config/env.js";

const baseEnv: Env = {
  DATABASE_URL: "postgresql://adalah:adalah_dev@localhost:5432/adalah",
  JWT_SECRET: "test-secret-key-minimum-32-characters-long",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_DAYS: 7,
  PORT: 3001,
  HOST: "0.0.0.0",
  NODE_ENV: "development",
  LLM_PROVIDER: "mock",
  OPENAI_API_KEY: undefined,
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

describe("createAIProviders", () => {
  it("should use mock providers by default", () => {
    const providers = createAIProviders(baseEnv);
    expect(providers.llm.name).toBe("mock");
    expect(providers.embedder.name).toBe("mock");
  });

  it("should force mock in test NODE_ENV", () => {
    const providers = createAIProviders({
      ...baseEnv,
      NODE_ENV: "test",
      LLM_PROVIDER: "openai",
      EMBEDDER_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test",
    });
    expect(providers.llm.name).toBe("mock");
    expect(providers.embedder.name).toBe("mock");
  });

  it("should require OPENAI_API_KEY when LLM_PROVIDER=openai", () => {
    expect(() =>
      createAIProviders({ ...baseEnv, LLM_PROVIDER: "openai" })
    ).toThrow("OPENAI_API_KEY required");
  });

  it("should create openai providers when configured", () => {
    const providers = createAIProviders({
      ...baseEnv,
      LLM_PROVIDER: "openai",
      EMBEDDER_PROVIDER: "openai",
      OPENAI_API_KEY: "sk-test-key",
    });
    expect(providers.llm.name).toBe("openai");
    expect(providers.embedder.name).toBe("openai");
    expect(providers.embedder.dimensions).toBe(384);
  });
});
