import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { Env } from "../src/config/env.js";
import { buildApp } from "../src/app.js";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://adalah:adalah_dev@localhost:5432/adalah";

export const testEnv: Env = {
  DATABASE_URL: TEST_DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ?? "test-secret-key-minimum-32-characters-long",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_DAYS: 7,
  PORT: 3002,
  HOST: "127.0.0.1",
  NODE_ENV: "test",
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

let migrated = false;

export async function setupTestDb() {
  if (migrated) return;

  const client = postgres(TEST_DATABASE_URL, { max: 1 });
  await client`CREATE EXTENSION IF NOT EXISTS vector`.catch(() => {
    // pgvector may not be installed in all environments
  });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await client.end();
  migrated = true;
}

export async function cleanupTestDb() {
  const client = postgres(TEST_DATABASE_URL, { max: 1 });
  await client`
    TRUNCATE TABLE
      document_chunks, documents, messages, chat_sessions,
      lawyer_profiles, refresh_tokens, users
    RESTART IDENTITY CASCADE
  `;
  await client.end();
}

export async function createTestApp() {
  await setupTestDb();
  return buildApp(testEnv);
}

export async function registerTestUser(app: Awaited<ReturnType<typeof buildApp>>) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: {
      email: "chat-test@example.com",
      password: "SecurePass1",
      name: "مستخدم تجريبي",
    },
  });
  const body = response.json();
  if (response.statusCode !== 201) {
    throw new Error(`Registration failed: ${response.statusCode} ${JSON.stringify(body)}`);
  }
  return {
    accessToken: body.tokens.accessToken as string,
    userId: body.user.id as string,
  };
}
