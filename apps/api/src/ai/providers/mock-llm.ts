import type { LLMMessage, LLMOptions, LLMProvider } from "../types.js";

const LEGAL_SYSTEM_PROMPT = `أنت مساعد قانوني ذكي في منصة عدالة.
أجب بالعربية الفصحى بناءً على السياق المقدم فقط.
إن لم تجد إجابة في السياق، قل ذلك بوضوح.
أضف تحذيرًا: "هذه المعلومات استشارية وليست استشارة قانونية رسمية."`;

export class MockLLMProvider implements LLMProvider {
  readonly name = "mock";

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const hasContext = options?.systemPrompt?.includes("[1]");
    const contextNote = hasContext ? " بناءً على [1]" : "";
    return `إجابة تجريبية${contextNote}: ${lastUser?.content ?? "لا يوجد سؤال"}. هذه المعلومات استشارية وليست استشارة قانونية رسمية.`;
  }

  async *stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string> {
    const text = await this.complete(messages, {
      ...options,
      systemPrompt: options?.systemPrompt ?? LEGAL_SYSTEM_PROMPT,
    });
    const words = text.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 1));
    }
  }
}
