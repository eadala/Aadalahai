export interface LegalArticle {
  number: string;
  label: string;
  text: string;
}

const ARTICLE_PATTERNS = [
  /المادة\s*(\d+)\s*[:：]?\s*([^المادة]{0,200})/g,
  /م\.\s*(\d+)\s*[:：]?\s*([^.]{0,200})/g,
  /الفقرة\s*(\d+)\s*[:：]?\s*([^الفقرة]{0,200})/g,
];

export function extractLegalArticles(text: string): LegalArticle[] {
  const articles: LegalArticle[] = [];
  const seen = new Set<string>();

  for (const pattern of ARTICLE_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const number = match[1];
      const key = number;
      if (seen.has(key)) continue;
      seen.add(key);

      const rawText = match[2]?.trim().replace(/\s+/g, " ") ?? "";
      articles.push({
        number,
        label: `المادة ${number}`,
        text: rawText.slice(0, 150),
      });
    }
  }

  return articles;
}

export function extractExcerpt(content: string, query?: string): string {
  if (!query) return content.slice(0, 200);

  const queryWords = query
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 5);

  if (queryWords.length === 0) return content.slice(0, 200);

  let bestStart = 0;
  let bestScore = 0;

  for (let i = 0; i < content.length - 50; i += 20) {
    const slice = content.slice(i, i + 200);
    const score = queryWords.filter((w) => slice.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }

  const excerpt = content.slice(bestStart, bestStart + 200).trim();
  return excerpt || content.slice(0, 200);
}

export type CitationConfidence = "high" | "medium" | "low";

export function similarityToConfidence(similarity: number): CitationConfidence {
  if (similarity >= 0.7) return "high";
  if (similarity >= 0.4) return "medium";
  return "low";
}

export const MIN_CITATION_SIMILARITY = 0.25;
