import { describe, it, expect } from "vitest";
import {
  LEGAL_ASSISTANT_BASE_PROMPT,
  buildLegalSystemPrompt,
  promptHasRagContext,
} from "../src/ai/prompts/legal-assistant.js";

describe("legal-assistant prompts", () => {
  it("should include core Arabic legal instructions", () => {
    expect(LEGAL_ASSISTANT_BASE_PROMPT).toContain("عدالة");
    expect(LEGAL_ASSISTANT_BASE_PROMPT).toContain("السياق القانوني");
    expect(LEGAL_ASSISTANT_BASE_PROMPT).toContain("استشارية");
    expect(LEGAL_ASSISTANT_BASE_PROMPT).toContain("[1]");
  });

  it("should handle missing documents", () => {
    const prompt = buildLegalSystemPrompt({ context: "", citations: [] });
    expect(prompt).toContain("لا توجد وثائق قانونية");
    expect(prompt).not.toContain("## السياق القانوني\n\n");
  });

  it("should include context and citations when provided", () => {
    const prompt = buildLegalSystemPrompt({
      context: "[1] نظام العمل\nالمادة 77: نص تجريبي",
      citations: [
        {
          index: 1,
          documentId: "doc-1",
          documentTitle: "نظام العمل",
          chunkContent: "المادة 77",
          excerpt: "المادة 77",
          similarity: 0.9,
          confidence: "high",
          articles: [{ number: "77", label: "المادة 77", text: "نص تجريبي" }],
        },
      ],
    });
    expect(prompt).toContain("## السياق القانوني");
    expect(prompt).toContain("نظام العمل");
    expect(prompt).toContain("[1] نظام العمل");
    expect(promptHasRagContext(prompt)).toBe(true);
  });

  it("should detect RAG context in system prompt", () => {
    expect(promptHasRagContext("## السياق القانوني\nfoo")).toBe(true);
    expect(promptHasRagContext("no context")).toBe(false);
  });
});
