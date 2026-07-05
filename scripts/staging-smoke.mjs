#!/usr/bin/env node
import { runSmokeTests } from "./smoke-lib.mjs";

runSmokeTests({
  label: "staging-smoke",
  apiUrl: process.env.API_URL ?? "http://localhost:3001",
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  maxWaitMs: Number(process.env.STAGING_WAIT_MS ?? 120_000),
  emailPrefix: "staging",
}).catch((err) => {
  console.error("[staging-smoke] Fatal:", err.message);
  process.exit(1);
});
