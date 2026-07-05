import { eq, desc } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { documents, documentChunks } from "../../db/schema.js";
import type { Embedder } from "../../ai/types.js";
import { chunkText } from "../../lib/chunking.js";
import { AppError } from "../../lib/errors.js";
import type { Env } from "../../config/env.js";

export class DocumentService {
  constructor(
    private readonly db: Database,
    private readonly embedder: Embedder,
    private readonly env: Env
  ) {}

  async create(userId: string, title: string, content: string) {
    const [doc] = await this.db
      .insert(documents)
      .values({ userId, title, content, status: "processing" })
      .returning();

    try {
      const chunks = chunkText(content, this.env.RAG_CHUNK_SIZE, this.env.RAG_CHUNK_OVERLAP);
      if (chunks.length === 0) {
        throw new AppError("EMPTY_DOCUMENT", "الوثيقة فارغة", 400);
      }

      const embeddings = await this.embedder.embedBatch(chunks);

      await this.db.insert(documentChunks).values(
        chunks.map((chunk, index) => ({
          documentId: doc.id,
          content: chunk,
          chunkIndex: index,
          embedding: embeddings[index],
        }))
      );

      const [updated] = await this.db
        .update(documents)
        .set({ status: "ready", updatedAt: new Date() })
        .where(eq(documents.id, doc.id))
        .returning();

      return this.toResponse(updated, chunks.length);
    } catch (error) {
      await this.db
        .update(documents)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(documents.id, doc.id));
      throw error;
    }
  }

  async list(userId: string) {
    const docs = await this.db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));

    return docs.map((d) => this.toResponse(d));
  }

  async getById(userId: string, documentId: string) {
    const [doc] = await this.db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc || doc.userId !== userId) {
      throw new AppError("DOCUMENT_NOT_FOUND", "الوثيقة غير موجودة", 404);
    }

    const chunks = await this.db
      .select({ id: documentChunks.id, chunkIndex: documentChunks.chunkIndex })
      .from(documentChunks)
      .where(eq(documentChunks.documentId, documentId));

    return this.toResponse(doc, chunks.length);
  }

  private toResponse(doc: typeof documents.$inferSelect, chunkCount?: number) {
    return {
      id: doc.id,
      title: doc.title,
      status: doc.status,
      contentPreview: doc.content.slice(0, 200),
      chunkCount,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
