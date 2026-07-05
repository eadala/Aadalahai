import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenAILLMProvider } from "../src/ai/providers/openai-llm.js";
import { OpenAIEmbedder } from "../src/ai/providers/openai-embedder.js";
import { OpenAIError } from "../src/ai/openai-errors.js";

const fetchOptions = { apiKey: "sk-test", timeoutMs: 5000, maxRetries: 1 };

describe("OpenAI providers", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should complete chat via OpenAI API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "إجابة قانونية" } }] }),
        { status: 200 }
      )
    );

    const llm = new OpenAILLMProvider(fetchOptions, "gpt-4o-mini");
    const result = await llm.complete([{ role: "user", content: "سؤال" }]);

    expect(result).toBe("إجابة قانونية");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should throw OpenAIError on API failure", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Invalid key", code: "invalid_api_key" } }), {
        status: 401,
      })
    );

    const llm = new OpenAILLMProvider(fetchOptions, "gpt-4o-mini");
    await expect(llm.complete([{ role: "user", content: "test" }])).rejects.toThrow(OpenAIError);
  });

  it("should retry on rate limit", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: { message: "Rate limited" } }), { status: 429 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
          { status: 200 }
        )
      );

    const llm = new OpenAILLMProvider(fetchOptions, "gpt-4o-mini");
    const result = await llm.complete([{ role: "user", content: "test" }]);
    expect(result).toBe("ok");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should embed batch via OpenAI API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ data: [{ embedding: [0.1, 0.2, 0.3] }, { embedding: [0.4, 0.5, 0.6] }] }),
        { status: 200 }
      )
    );

    const embedder = new OpenAIEmbedder(fetchOptions, "text-embedding-3-small", 3);
    const result = await embedder.embedBatch(["نص 1", "نص 2"]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([0.1, 0.2, 0.3]);
  });

  it("should stream tokens from OpenAI", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"مر"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"حبا"}}]}\n\n'));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    vi.mocked(fetch).mockResolvedValueOnce(new Response(stream, { status: 200 }));

    const llm = new OpenAILLMProvider(fetchOptions, "gpt-4o-mini");
    const chunks: string[] = [];
    for await (const chunk of llm.stream([{ role: "user", content: "مرحبا" }])) {
      chunks.push(chunk);
    }

    expect(chunks.join("")).toBe("مرحبا");
  });
});
