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

    const chunks = results.map((row) => ({
      chunkId: row.chunk_id,
      documentId: row.document_id,
      documentTitle: row.document_title,
      content: row.content,
      similarity: Number(row.similarity),
    }));

    if (this.env.METRICS_ENABLED) {
      metrics.ragDurationMs.observe("adalah_rag_duration_ms", Date.now() - start, {
        provider: this.embedder.name,
      });
    }

    return chunks;
  }

  buildContext(chunks: RetrievedChunk[]): string {
    if (chunks.length === 0) return "";
    return chunks
      .map(
        (c, i) =>
          `[${i + 1}] ${c.documentTitle}\n${c.content}`
      )
      .join("\n\n");
  }

  toCitations(chunks: RetrievedChunk[], query?: string): Citation[] {
    return buildEnhancedCitations(chunks, query);
  }
}
