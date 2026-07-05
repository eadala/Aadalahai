#!/usr/bin/env node
/**
 * Wait until DATABASE_URL is reachable (used before migrations in Docker).
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const maxAttempts = Number(process.env.DB_WAIT_ATTEMPTS ?? 30);
const delayMs = Number(process.env.DB_WAIT_DELAY_MS ?? 2000);

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const sql = postgres(url, { max: 1, connect_timeout: 5 });
  try {
    await sql`SELECT 1`;
    await sql.end();
    console.log("Database is ready");
    process.exit(0);
  } catch (err) {
    await sql.end().catch(() => {});
    console.log(`Database not ready (${attempt}/${maxAttempts})`);
    if (attempt === maxAttempts) {
      console.error("Database wait timeout:", err);
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
