import type { LLMMessage, LLMOptions, LLMProvider } from "../types.js";
import { promptHasRagContext } from "../prompts/legal-assistant.js";
import { isDocumentAnalysisRequest } from "../prompts/document-analysis.js";

export class MockLLMProvider implements LLMProvider {
  readonly name = "mock";

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");

    if (isDocumentAnalysisRequest(lastUser?.content, options?.systemPrompt)) {
      const title = lastUser?.content.match(/## عنوان الوثيقة\n(.+)/)?.[1] ?? "وثيقة";
      return JSON.stringify({
        summary: `ملخص تجريبي لوثيقة «${title}». هذا التحليل استشاري وليس استشارة قانونية رسمية.`,
        keyClauses: [{ title: "بند تجريبي", content: "شرح تجريبي للبند الرئيسي." }],
        risks: [{ level: "medium", description: "مخاطرة تجريبية محتملة." }],
        recommendations: ["مراجعة البنود مع محامٍ مرخّص", "التحقق من الامتثال للأنظمة المحلية"],
      });
    }

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
