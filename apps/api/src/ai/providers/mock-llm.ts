import type { LLMMessage, LLMOptions, LLMProvider } from "../types.js";
import { promptHasRagContext } from "../prompts/legal-assistant.js";

export class MockLLMProvider implements LLMProvider {
  readonly name = "mock";

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const hasContext = promptHasRagContext(options?.systemPrompt);
    const contextNote = hasContext ? " بناءً على [1]" : "";
    return (
      `**الملخص:** إجابة تجريبية${contextNote}.\n` +
      `**التفصيل:** ${lastUser?.content ?? "لا يوجد سؤال"}\n` +
      `**تنبيه:** هذه المعلومات استشارية وليست استشارة قانونية رسمية — راجع محامٍ مرخّص.`
    );
  }

  async *stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string> {
    const text = await this.complete(messages, options);
    const words = text.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 1));
    }
  }
}
