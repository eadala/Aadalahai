import type { Citation } from "../../db/schema.js";
import type { RetrievedChunk } from "./types.js";
import {
  extractLegalArticles,
  extractExcerpt,
  similarityToConfidence,
} from "../../lib/citation-parser.js";

export function buildEnhancedCitations(
  chunks: RetrievedChunk[],
  query?: string
): Citation[] {
  return chunks
    .filter((c) => c.similarity >= 0.1)
    .map((c, i) => {
      const articles =
        c.source === "legislation" && c.articleRef
          ? [
              {
                number: c.articleRef.replace(/\D/g, "") || String(i + 1),
                label: c.articleRef,
                text: c.content.slice(0, 200),
              },
            ]
          : extractLegalArticles(c.content);

      return {
        index: i + 1,
        source: c.source,
        documentId: c.documentId,
        legislationId: c.legislationId,
        documentTitle: c.documentTitle,
        articleRef: c.articleRef,
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
      const ref = c.articleRef && !articles.includes(c.articleRef) ? ` — ${c.articleRef}` : "";
      const type = c.source === "legislation" ? " (تشريع)" : "";
      return `[${c.index}] ${c.documentTitle}${ref}${articles ? ` — ${articles}` : ""}${type}`;
    })
    .join("\n");
}
