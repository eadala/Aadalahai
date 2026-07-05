import type { Env } from "../config/env.js";
import { getOpenAIFetchOptions, resolveEmbedderProvider, resolveLLMProvider } from "../config/env.js";
import type { Embedder, LLMProvider } from "./types.js";
import { MockLLMProvider } from "./providers/mock-llm.js";
import { MockEmbedder } from "./providers/mock-embedder.js";
import { OpenAILLMProvider } from "./providers/openai-llm.js";
import { OpenAIEmbedder } from "./providers/openai-embedder.js";
import { instrumentEmbedder, instrumentLLM } from "./instrumentation.js";

export interface AIProviders {
  llm: LLMProvider;
  embedder: Embedder;
}

export function createAIProviders(env: Env): AIProviders {
  const llmProvider = resolveLLMProvider(env);
  const embedderProvider = resolveEmbedderProvider(env);

  let llm: LLMProvider;
  if (llmProvider === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY required when LLM_PROVIDER=openai");
    }
    llm = new OpenAILLMProvider(getOpenAIFetchOptions(env), env.OPENAI_MODEL);
  } else {
    llm = new MockLLMProvider();
  }

  let embedder: Embedder;
  if (embedderProvider === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY required when EMBEDDER_PROVIDER=openai");
    }
    embedder = new OpenAIEmbedder(
      getOpenAIFetchOptions(env),
      env.OPENAI_EMBEDDING_MODEL,
      env.EMBEDDING_DIMENSIONS
    );
  } else {
    embedder = new MockEmbedder(env.EMBEDDING_DIMENSIONS);
  }

  if (env.METRICS_ENABLED) {
    return {
      llm: instrumentLLM(llm),
      embedder: instrumentEmbedder(embedder),
    };
  }

  return { llm, embedder };
}
