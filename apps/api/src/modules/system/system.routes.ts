import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { resolveEmbedderProvider, resolveLLMProvider } from "../../config/env.js";
import { metrics } from "../../lib/metrics.js";

export async function systemRoutes(app: FastifyInstance) {
  app.get("/ready", async (_request, reply) => {
    const checks: Record<string, { status: string; latencyMs?: number; provider?: string }> = {};
    let overall = "ready";

    const dbStart = Date.now();
    try {
      await app.db.execute(sql`SELECT 1`);
      checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
    } catch {
      checks.database = { status: "error", latencyMs: Date.now() - dbStart };
      overall = "unavailable";
    }

    const llmProvider = resolveLLMProvider(app.config);
    const embedderProvider = resolveEmbedderProvider(app.config);

    checks.llm = {
      status: llmProvider === "openai" && !app.config.OPENAI_API_KEY ? "error" : "ok",
      provider: llmProvider,
    };
    checks.embedder = {
      status: embedderProvider === "openai" && !app.config.OPENAI_API_KEY ? "error" : "ok",
      provider: embedderProvider,
    };

    if (checks.llm.status === "error" || checks.embedder.status === "error") {
      overall = overall === "unavailable" ? "unavailable" : "degraded";
    }

    const statusCode = overall === "unavailable" ? 503 : 200;

    return reply.status(statusCode).send({
      status: overall,
      service: "adalah-api",
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/metrics", async (_request, reply) => {
    if (!app.config.METRICS_ENABLED) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Metrics disabled", details: [] },
      });
    }

    return reply
      .header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
      .send(metrics.toPrometheus());
  });
}
