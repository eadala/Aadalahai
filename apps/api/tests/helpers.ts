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
};

let migrated = false;

export async function setupTestDb() {
  if (migrated) return;

  const client = postgres(TEST_DATABASE_URL, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  await client.end();
  migrated = true;
}

export async function cleanupTestDb() {
  const client = postgres(TEST_DATABASE_URL, { max: 1 });
  await client`TRUNCATE TABLE refresh_tokens, users RESTART IDENTITY CASCADE`;
  await client.end();
}

export async function createTestApp() {
  await setupTestDb();
  return buildApp(testEnv);
}
