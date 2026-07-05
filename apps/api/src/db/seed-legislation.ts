import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";
import { createAIProviders } from "../ai/factory.js";
import { LegislationService } from "../modules/legislation/legislation.service.js";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://adalah:adalah_dev@localhost:5432/adalah";

async function seedLegislation() {
  const client = postgres(connectionString, { max: 1, connect_timeout: 30 });
  const db = drizzle(client, { schema });

  const env = {
    DATABASE_URL: connectionString,
    NODE_ENV: (process.env.NODE_ENV ?? "production") as "production" | "development" | "test",
    LLM_PROVIDER: (process.env.LLM_PROVIDER ?? "mock") as "mock" | "openai",
    EMBEDDER_PROVIDER: (process.env.EMBEDDER_PROVIDER ?? "mock") as "mock" | "openai",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    OPENAI_TIMEOUT_MS: Number(process.env.OPENAI_TIMEOUT_MS ?? 30_000),
    OPENAI_MAX_RETRIES: Number(process.env.OPENAI_MAX_RETRIES ?? 2),
    EMBEDDING_DIMENSIONS: Number(process.env.EMBEDDING_DIMENSIONS ?? 384),
    JWT_SECRET: process.env.JWT_SECRET ?? "seed-only-secret-minimum-32-characters",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_DAYS: 7,
    PORT: 3001,
    HOST: "0.0.0.0",
    RAG_TOP_K: 5,
    RAG_CHUNK_SIZE: 500,
    RAG_CHUNK_OVERLAP: 50,
    METRICS_ENABLED: false,
  };

  const { embedder } = createAIProviders(env);
  const service = new LegislationService(db, embedder);
  const seeded = await service.seedCorpusIfEmpty();

  if (seeded) {
    console.log("Legislation corpus seeded.");
  } else {
    console.log("Legislation corpus already present, skipping seed.");
  }

  await client.end();
}

seedLegislation().catch((err) => {
  console.error("Legislation seed failed:", err);
  process.exit(1);
});
