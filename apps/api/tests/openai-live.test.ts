import { describe, it, expect } from "vitest";
import { OpenAILLMProvider } from "../src/ai/providers/openai-llm.js";
import { OpenAIEmbedder } from "../src/ai/providers/openai-embedder.js";
import { buildLegalSystemPrompt } from "../src/ai/prompts/legal-assistant.js";

const RUN_LIVE = process.env.RUN_OPENAI_LIVE === "1" && !!process.env.OPENAI_API_KEY;

const fetchOptions = {
  apiKey: process.env.OPENAI_API_KEY!,
  timeoutMs: 60_000,
  maxRetries: 1,
};

describe.skipIf(!RUN_LIVE)("OpenAI Live Integration", () => {
  it("should complete Arabic legal response", async () => {
    const llm = new OpenAILLMProvider(fetchOptions, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
    const systemPrompt = buildLegalSystemPrompt({
      context: "[1] نظام العمل\nالمادة 77: للعامل الحق في إجازة سنوية مدفوعة الأجر.",
      citations: [
        {
          index: 1,
          documentId: "test",
          documentTitle: "نظام العمل",
          chunkContent: "المادة 77",
          excerpt: "المادة 77",
          similarity: 0.9,
          confidence: "high",
          articles: [{ number: "77", label: "المادة 77", text: "إجازة سنوية" }],
        },
      ],
    });

    const result = await llm.complete(
      [{ role: "user", content: "ما حق العامل في الإجازة؟" }],
      { systemPrompt, temperature: 0.2 }
    );

    expect(result.length).toBeGreaterThan(40);
    expect(result).toMatch(/استشاري|تنبيه|المادة|إجازة/i);
  }, 90_000);

  it("should generate embeddings", async () => {
    const embedder = new OpenAIEmbedder(fetchOptions, "text-embedding-3-small", 384);
    const [vector] = await embedder.embedBatch(["المادة 77 من نظام العمل"]);
    expect(vector).toHaveLength(384);
    expect(vector.some((v) => v !== 0)).toBe(true);
  }, 30_000);
});
