import type { Citation } from "../../db/schema.js";
import type { RetrievedChunk } from "./types.js";
import {
  extractLegalArticles,
  extractExcerpt,
  similarityToConfidence,
  MIN_CITATION_SIMILARITY,
} from "../../lib/citation-parser.js";

export function buildEnhancedCitations(
  chunks: RetrievedChunk[],
  query?: string
): Citation[] {
  return chunks
    .filter((c) => c.similarity >= 0.1)
    .map((c, i) => {
      const articles = extractLegalArticles(c.content);
      return {
        index: i + 1,
        documentId: c.documentId,
        documentTitle: c.documentTitle,
        chunkContent: c.content.slice(0, 300),
        excerpt: extractExcerpt(c.content, query),
        similarity: c.similarity,
        confidence: similarityToConfidence(c.similarity),
        articles,
      };
    });
}

export function formatCitationReferences(citations: Citation[]): string {
  if (citations.length === 0) return "";
  return citations
    .map((c) => {
      const articles = c.articles.map((a) => a.label).join("، ");
      return `[${c.index}] ${c.documentTitle}${articles ? ` — ${articles}` : ""}`;
    })
    .join("\n");
}
