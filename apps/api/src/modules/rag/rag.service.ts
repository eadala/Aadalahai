import { sql } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import type { Embedder } from "../../ai/types.js";
import type { Citation } from "../../db/schema.js";
import { toVectorLiteral } from "../../lib/vector.js";
import type { Env } from "../../config/env.js";
import { buildEnhancedCitations } from "./citation.service.js";
import { metrics } from "../../lib/metrics.js";

import type { RetrievedChunk } from "./types.js";

export type { RetrievedChunk };

export class RAGService {
  constructor(
    private readonly db: Database,
    private readonly embedder: Embedder,
    private readonly env: Env
  ) {}

  async retrieve(userId: string, query: string): Promise<RetrievedChunk[]> {
    const start = Date.now();
    const queryEmbedding = await this.embedder.embed(query);
    const vectorLiteral = toVectorLiteral(queryEmbedding);

    const [userChunks, legislationChunks] = await Promise.all([
      this.retrieveUserDocuments(userId, vectorLiteral),
      this.retrieveLegislationCorpus(vectorLiteral),
    ]);

    const merged = [...userChunks, ...legislationChunks]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.env.RAG_TOP_K);

    if (this.env.METRICS_ENABLED) {
      metrics.ragDurationMs.observe("adalah_rag_duration_ms", Date.now() - start, {
        provider: this.embedder.name,
      });
    }

    return merged;
  }

  /** User documents only — used by scoped search (scope=user). */
  async retrieveUserOnly(userId: string, query: string): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.embedder.embed(query);
    const vectorLiteral = toVectorLiteral(queryEmbedding);
    return this.retrieveUserDocuments(userId, vectorLiteral);
  }

  private async retrieveUserDocuments(
    userId: string,
    vectorLiteral: string
  ): Promise<RetrievedChunk[]> {
    const results = await this.db.execute<{
      chunk_id: string;
      document_id: string;
      document_title: string;
      content: string;
      similarity: number;
    }>(sql`
      SELECT
        dc.id AS chunk_id,
        d.id AS document_id,
        d.title AS document_title,
        dc.content,
        1 - (dc.embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM document_chunks dc
      INNER JOIN documents d ON d.id = dc.document_id
      WHERE d.user_id = ${userId}
        AND d.status = 'ready'
      ORDER BY dc.embedding <=> ${vectorLiteral}::vector
      LIMIT ${this.env.RAG_TOP_K}
    `);

    return results.map((row) => ({
      chunkId: row.chunk_id,
      source: "user" as const,
      documentId: row.document_id,
      legislationId: null,
      documentTitle: row.document_title,
      articleRef: null,
      category: null,
      content: row.content,
      similarity: Number(row.similarity),
    }));
  }

  private async retrieveLegislationCorpus(vectorLiteral: string): Promise<RetrievedChunk[]> {
    const results = await this.db.execute<{
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
      LIMIT ${this.env.RAG_TOP_K}
    `);

    return results.map((row) => ({
      chunkId: row.chunk_id,
      source: "legislation" as const,
      documentId: null,
      legislationId: row.legislation_id,
      documentTitle: row.title,
      articleRef: row.article_ref,
      category: row.category,
      content: row.content,
      similarity: Number(row.similarity),
    }));
  }

  buildContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) return "";
    return chunks
      .map((c, i) => {
        const label =
          c.source === "legislation"
            ? `${c.documentTitle}${c.articleRef ? ` — ${c.articleRef}` : ""} [تشريع]`
            : c.documentTitle;
        return `[${i + 1}] ${label}\n${c.content}`;
      })
      .join("\n\n");
  }

  toCitations(chunks: RetrievedChunk[], query?: string): Citation[] {
    return buildEnhancedCitations(chunks, query);
  }
}
