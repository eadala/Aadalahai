import { count } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { legislationSources, legislationChunks } from "../../db/schema.js";
import type { Embedder } from "../../ai/types.js";
import { LEGISLATION_CORPUS_SEED } from "./legislation.seed-data.js";

export class LegislationService {
  constructor(
    private readonly db: Database,
    private readonly embedder: Embedder
  ) {}

  async seedCorpusIfEmpty(): Promise<boolean> {
    const [stats] = await this.db.select({ total: count() }).from(legislationSources);
    if (Number(stats?.total ?? 0) > 0) return false;

    for (const item of LEGISLATION_CORPUS_SEED) {
      const [source] = await this.db
        .insert(legislationSources)
        .values({
          title: item.title,
          category: item.category,
          jurisdiction: item.jurisdiction,
        })
        .returning();

      const texts = item.articles.map((a) => a.content);
      const embeddings = await this.embedder.embedBatch(texts);

      await this.db.insert(legislationChunks).values(
        item.articles.map((article, index) => ({
          legislationId: source.id,
          articleRef: article.articleRef,
          content: article.content,
          chunkIndex: index,
          embedding: embeddings[index],
        }))
      );
    }

    return true;
  }

  async listSources() {
    const sources = await this.db.select().from(legislationSources);
    return sources.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      jurisdiction: s.jurisdiction,
      createdAt: s.createdAt.toISOString(),
    }));
  }
}
