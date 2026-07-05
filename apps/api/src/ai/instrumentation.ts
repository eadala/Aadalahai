import type { Embedder, LLMMessage, LLMOptions, LLMProvider } from "./types.js";
import { metrics } from "../lib/metrics.js";

export function instrumentLLM(llm: LLMProvider): LLMProvider {
  return {
    name: llm.name,
    async complete(messages: LLMMessage[], options?: LLMOptions) {
      const start = Date.now();
      metrics.llmRequests.inc("adalah_llm_requests_total", { provider: llm.name, mode: "complete" });
      try {
        const result = await llm.complete(messages, options);
        metrics.llmDurationMs.observe("adalah_llm_duration_ms", Date.now() - start, {
          provider: llm.name,
          mode: "complete",
        });
        return result;
      } catch (error) {
        metrics.llmErrors.inc("adalah_llm_errors_total", { provider: llm.name, mode: "complete" });
        throw error;
      }
    },
    async *stream(messages: LLMMessage[], options?: LLMOptions) {
      const start = Date.now();
      metrics.llmRequests.inc("adalah_llm_requests_total", { provider: llm.name, mode: "stream" });
      try {
        for await (const chunk of llm.stream(messages, options)) {
          yield chunk;
        }
        metrics.llmDurationMs.observe("adalah_llm_duration_ms", Date.now() - start, {
          provider: llm.name,
          mode: "stream",
        });
      } catch (error) {
        metrics.llmErrors.inc("adalah_llm_errors_total", { provider: llm.name, mode: "stream" });
        throw error;
      }
    },
  };
}

export function instrumentEmbedder(embedder: Embedder): Embedder {
  return {
    name: embedder.name,
    dimensions: embedder.dimensions,
    async embed(text: string) {
      const start = Date.now();
      metrics.embeddingRequests.inc("adalah_embedding_requests_total", {
        provider: embedder.name,
        mode: "single",
      });
      try {
        const result = await embedder.embed(text);
        metrics.embeddingDurationMs.observe("adalah_embedding_duration_ms", Date.now() - start, {
          provider: embedder.name,
          mode: "single",
        });
        return result;
      } catch (error) {
        metrics.embeddingErrors.inc("adalah_embedding_errors_total", {
          provider: embedder.name,
          mode: "single",
        });
        throw error;
      }
    },
    async embedBatch(texts: string[]) {
      const start = Date.now();
      metrics.embeddingRequests.inc("adalah_embedding_requests_total", {
        provider: embedder.name,
        mode: "batch",
      });
      try {
        const result = await embedder.embedBatch(texts);
        metrics.embeddingDurationMs.observe("adalah_embedding_duration_ms", Date.now() - start, {
          provider: embedder.name,
          mode: "batch",
        });
        return result;
      } catch (error) {
        metrics.embeddingErrors.inc("adalah_embedding_errors_total", {
          provider: embedder.name,
          mode: "batch",
        });
        throw error;
      }
    },
  };
}
