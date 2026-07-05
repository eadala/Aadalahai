import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const rootDir = path.resolve(__dirname, "../..");

const apiEnv: Record<string, string> = {
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://adalah:adalah_dev@localhost:5432/adalah",
  JWT_SECRET:
    process.env.JWT_SECRET ?? "change-me-to-a-random-64-char-string-in-production",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_DAYS: process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7",
  NODE_ENV: "development",
  LLM_PROVIDER: "mock",
  EMBEDDER_PROVIDER: "mock",
  EMBEDDING_DIMENSIONS: "384",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://localhost:3001/health",
      cwd: rootDir,
      env: apiEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev:web",
      url: "http://localhost:3000",
      cwd: rootDir,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: "http://localhost:3001",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
