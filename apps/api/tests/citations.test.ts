import { describe, it, expect } from "vitest";
import {
  extractLegalArticles,
  extractExcerpt,
  similarityToConfidence,
} from "../src/lib/citation-parser.js";
import { buildEnhancedCitations } from "../src/modules/rag/citation.service.js";
import type { RetrievedChunk } from "../src/modules/rag/types.js";

describe("Citation Parser", () => {
  it("should extract Arabic legal articles", () => {
    const text = "المادة 77: للعامل الحق في إنهاء العقد. المادة 80: يحق لصاحب العمل الفسخ.";
    const articles = extractLegalArticles(text);
    expect(articles.length).toBeGreaterThanOrEqual(2);
    expect(articles[0].label).toBe("المادة 77");
    expect(articles[0].number).toBe("77");
  });

  it("should extract excerpt relevant to query", () => {
    const content = "نص عام. المادة 77: للعامل الحق في إنهاء العقد دون مكافأة. نص لاحق.";
    const excerpt = extractExcerpt(content, "حقوق العامل إنهاء العقد");
    expect(excerpt).toContain("المادة 77");
  });

  it("should map similarity to confidence", () => {
    expect(similarityToConfidence(0.85)).toBe("high");
    expect(similarityToConfidence(0.55)).toBe("medium");
    expect(similarityToConfidence(0.2)).toBe("low");
  });
});

describe("Enhanced Citations", () => {
  it("should build enhanced citations with articles", () => {
    const chunks: RetrievedChunk[] = [
      {
        chunkId: "1",
        documentId: "d1",
        documentTitle: "نظام العمل",
        content: "المادة 77: للعامل الحق في إنهاء العقد",
        similarity: 0.8,
      },
    ];

    const citations = buildEnhancedCitations(chunks, "حقوق العامل");
    expect(citations).toHaveLength(1);
    expect(citations[0].index).toBe(1);
    expect(citations[0].confidence).toBe("high");
    expect(citations[0].articles.length).toBeGreaterThan(0);
  });

  it("should include low-confidence citations instead of hiding them", () => {
    const chunks: RetrievedChunk[] = [
      {
        chunkId: "2",
        documentId: "d1",
        documentTitle: "نظام العمل",
        content: "نص غير ذي صلة",
        similarity: 0.2,
      },
    ];

    const citations = buildEnhancedCitations(chunks);
    expect(citations).toHaveLength(1);
    expect(citations[0].confidence).toBe("low");
  });
});
