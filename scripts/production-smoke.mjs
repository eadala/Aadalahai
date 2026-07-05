#!/usr/bin/env node
import { runSmokeTests } from "./smoke-lib.mjs";

runSmokeTests({
  label: "production-smoke",
  apiUrl: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  maxWaitMs: Number(process.env.PROD_WAIT_MS ?? 180_000),
  emailPrefix: "prod",
}).catch((err) => {
  console.error("[production-smoke] Fatal:", err.message);
  process.exit(1);
});
