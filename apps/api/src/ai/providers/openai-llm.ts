import type { LLMMessage, LLMOptions, LLMProvider } from "../types.js";

interface OpenAIChatResponse {
  choices: Array<{ message: { content: string } }>;
}

interface OpenAIStreamChunk {
  choices: Array<{ delta: { content?: string } }>;
}

export class OpenAILLMProvider implements LLMProvider {
  readonly name = "openai";

  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildMessages(messages, options),
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as OpenAIChatResponse;
    return data.choices[0]?.message?.content ?? "";
  }

  async *stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildMessages(messages, options),
        temperature: options?.temperature ?? 0.3,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as OpenAIStreamChunk;
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  private buildMessages(messages: LLMMessage[], options?: LLMOptions) {
    const result: LLMMessage[] = [];
    if (options?.systemPrompt) {
      result.push({ role: "system", content: options.systemPrompt });
    }
    return [...result, ...messages];
  }
}
