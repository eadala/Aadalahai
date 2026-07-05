import { sql } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import type { Env } from "../../config/env.js";
import { RAGService } from "../rag/rag.service.js";
import type { Embedder } from "../../ai/types.js";
import { toVectorLiteral } from "../../lib/vector.js";

export type SearchScope = "all" | "user" | "legislation";

export interface SearchResult {
  chunkId: string;
  source: "user" | "legislation";
  documentId: string | null;
  legislationId: string | null;
  documentTitle: string;
  articleRef: string | null;
  category: string | null;
  excerpt: string;
  score: number;
  matchType: "hybrid" | "vector" | "keyword";
}

export class SearchService {
  private readonly rag: RAGService;

  constructor(
    private readonly db: Database,
    private readonly embedder: Embedder,
    private readonly env: Env
  ) {
    this.rag = new RAGService(db, embedder, env);
  }

  async search(
    userId: string,
    query: string,
    limit = 10,
    scope: SearchScope = "all"
  ): Promise<SearchResult[]> {
    const tasks: Promise<SearchResult[]>[] = [];

    if (scope === "all" || scope === "user") {
      tasks.push(this.searchUserDocuments(userId, query, limit));
    }
    if (scope === "all" || scope === "legislation") {
      tasks.push(this.searchLegislationCorpus(query, limit));
    }

    const merged = (await Promise.all(tasks)).flat();
    return merged.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private async searchUserDocuments(userId: string, query: string, limit: number) {
    const [vectorChunks, keywordChunks] = await Promise.all([
      this.rag.retrieveUserOnly(userId, query),
      this.keywordSearchUser(userId, query, limit),
    ]);

    const merged = new Map<string, SearchResult>();

    for (const chunk of vectorChunks.filter((c) => c.source === "user")) {
      merged.set(`user:${chunk.chunkId}`, {
        chunkId: chunk.chunkId,
        source: "user",
        documentId: chunk.documentId,
        legislationId: null,
        documentTitle: chunk.documentTitle,
        articleRef: null,
        category: null,
        excerpt: this.buildExcerpt(chunk.content, query),
        score: chunk.similarity * 0.7,
        matchType: "vector",
      });
    }

    for (const chunk of keywordChunks) {
      const key = `user:${chunk.chunkId}`;
      const existing = merged.get(key);
      if (existing) {
        existing.score = Math.min(1, existing.score + 0.3);
        existing.matchType = "hybrid";
      } else {
        merged.set(key, {
          chunkId: chunk.chunkId,
          source: "user",
          documentId: chunk.documentId,
          legislationId: null,
          documentTitle: chunk.documentTitle,
          articleRef: null,
          category: null,
          excerpt: this.buildExcerpt(chunk.content, query),
          score: 0.3,
          matchType: "keyword",
        });
      }
    }

    return Array.from(merged.values());
  }

  private async searchLegislationCorpus(query: string, limit: number) {
    const queryEmbedding = await this.embedder.embed(query);
    const vectorLiteral = toVectorLiteral(queryEmbedding);
    const pattern = `%${query.replace(/[%_]/g, "")}%`;

    const [vectorRows, keywordRows] = await Promise.all([
      this.db.execute<{
        chunk_id: string;
        legislation_id: string;
        title: string;
        category: string;
        article_ref: string;
        content: string;
        similarity: number;
      }>(sql`
        SELECT
          lc.id AS chunk_id,
          ls.id AS legislation_id,
          ls.title,
          ls.category,
          lc.article_ref,
          lc.content,
          1 - (lc.embedding <=> ${vectorLiteral}::vector) AS similarity
        FROM legislation_chunks lc
        INNER JOIN legislation_sources ls ON ls.id = lc.legislation_id
        ORDER BY lc.embedding <=> ${vectorLiteral}::vector
        LIMIT ${limit}
      `),
      this.db.execute<{
        chunk_id: string;
        legislation_id: string;
        title: string;
        category: string;
        article_ref: string;
        content: string;
      }>(sql`
        SELECT
          lc.id AS chunk_id,
          ls.id AS legislation_id,
          ls.title,
          ls.category,
          lc.article_ref,
          lc.content
        FROM legislation_chunks lc
        INNER JOIN legislation_sources ls ON ls.id = lc.legislation_id
        WHERE lc.content ILIKE ${pattern}
        ORDER BY ls.title
        LIMIT ${limit}
      `),
    ]);

    const merged = new Map<string, SearchResult>();

    for (const row of vectorRows) {
      merged.set(`leg:${row.chunk_id}`, {
        chunkId: row.chunk_id,
        source: "legislation",
        documentId: null,
        legislationId: row.legislation_id,
        documentTitle: row.title,
        articleRef: row.article_ref,
        category: row.category,
        excerpt: this.buildExcerpt(row.content, query),
        score: Number(row.similarity) * 0.7,
        matchType: "vector",
      });
    }

    for (const row of keywordRows) {
      const key = `leg:${row.chunk_id}`;
      const existing = merged.get(key);
      if (existing) {
        existing.score = Math.min(1, existing.score + 0.3);
        existing.matchType = "hybrid";
      } else {
        merged.set(key, {
          chunkId: row.chunk_id,
          source: "legislation",
          documentId: null,
          legislationId: row.legislation_id,
          documentTitle: row.title,
          articleRef: row.article_ref,
          category: row.category,
          excerpt: this.buildExcerpt(row.content, query),
          score: 0.3,
          matchType: "keyword",
        });
      }
    }

    return Array.from(merged.values());
  }

  private async keywordSearchUser(userId: string, query: string, limit: number) {
    const pattern = `%${query.replace(/[%_]/g, "")}%`;

    const results = await this.db.execute<{
      chunk_id: string;
      document_id: string;
      document_title: string;
      content: string;
    }>(sql`
      SELECT
        dc.id AS chunk_id,
        d.id AS document_id,
        d.title AS document_title,
        dc.content
      FROM document_chunks dc
      INNER JOIN documents d ON d.id = dc.document_id
      WHERE d.user_id = ${userId}
        AND d.status = 'ready'
        AND dc.content ILIKE ${pattern}
      ORDER BY d.updated_at DESC
      LIMIT ${limit}
    `);

    return results.map((row) => ({
      chunkId: row.chunk_id,
      documentId: row.document_id,
      documentTitle: row.document_title,
      content: row.content,
    }));
  }

  private buildExcerpt(content: string, query: string, maxLen = 240): string {
    const normalizedQuery = query.trim();
    const lowerContent = content.toLowerCase();
    const lowerQuery = normalizedQuery.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
      return content.length <= maxLen ? content : `${content.slice(0, maxLen)}...`;
    }

    const start = Math.max(0, index - 60);
    const end = Math.min(content.length, index + normalizedQuery.length + 120);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < content.length ? "..." : "";
    return `${prefix}${content.slice(start, end)}${suffix}`;
  }
}
