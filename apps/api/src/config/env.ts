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

  EMBEDDER_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(384),

  RAG_TOP_K: z.coerce.number().default(5),
  RAG_CHUNK_SIZE: z.coerce.number().default(500),
  RAG_CHUNK_OVERLAP: z.coerce.number().default(50),
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
