import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  LLM_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(30_000),
  OPENAI_MAX_RETRIES: z.coerce.number().default(2),

  EMBEDDER_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(384),

  RAG_TOP_K: z.coerce.number().default(5),
  RAG_CHUNK_SIZE: z.coerce.number().default(500),
  RAG_CHUNK_OVERLAP: z.coerce.number().default(50),

  METRICS_ENABLED: z
    .enum(["true", "false", "1", "0"])
    .default("true")
    .transform((v) => v === "true" || v === "1"),

  CORS_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment:\n${issues.join("\n")}`);
  }
  return result.data;
}

export function resolveLLMProvider(env: Env): "mock" | "openai" {
  if (env.NODE_ENV === "test") return "mock";
  return env.LLM_PROVIDER;
}

export function resolveEmbedderProvider(env: Env): "mock" | "openai" {
  if (env.NODE_ENV === "test") return "mock";
  return env.EMBEDDER_PROVIDER;
}

export function getOpenAIFetchOptions(env: Env) {
  return {
    apiKey: env.OPENAI_API_KEY!,
    timeoutMs: env.OPENAI_TIMEOUT_MS,
    maxRetries: env.OPENAI_MAX_RETRIES,
  };
}

export function resolveCorsOrigin(env: Env): boolean | string[] {
  if (!env.CORS_ORIGINS || env.CORS_ORIGINS.trim() === "") return true;
  return env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
}
