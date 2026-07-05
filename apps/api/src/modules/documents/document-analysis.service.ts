import { eq, desc, and } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { documents, documentAnalyses } from "../../db/schema.js";
import type { LLMProvider } from "../../ai/types.js";
import {
  buildDocumentAnalysisPrompt,
  DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
} from "../../ai/prompts/document-analysis.js";
import { analysisOutputSchema } from "./document-analysis.schema.js";
import { AppError } from "../../lib/errors.js";

export class DocumentAnalysisService {
  constructor(
    private readonly db: Database,
    private readonly llm: LLMProvider
  ) {}

  async analyze(userId: string, documentId: string) {
    const [doc] = await this.db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .limit(1);

    if (!doc) {
      throw new AppError("DOCUMENT_NOT_FOUND", "الوثيقة غير موجودة", 404);
    }

    if (doc.status !== "ready") {
      throw new AppError("DOCUMENT_NOT_READY", "الوثيقة غير جاهزة للتحليل", 400);
    }

    const raw = await this.llm.complete(
      [{ role: "user", content: buildDocumentAnalysisPrompt(doc.title, doc.content) }],
      { systemPrompt: DOCUMENT_ANALYSIS_SYSTEM_PROMPT, temperature: 0.2 }
    );

    const parsed = this.parseAnalysisOutput(raw);

    const [saved] = await this.db
      .insert(documentAnalyses)
      .values({
        documentId: doc.id,
        userId,
        summary: parsed.summary,
        keyClauses: parsed.keyClauses,
        risks: parsed.risks,
        recommendations: parsed.recommendations,
      })
      .returning();

    return this.toResponse(saved, doc.title);
  }

  async listByDocument(userId: string, documentId: string) {
    const [doc] = await this.db
      .select({ id: documents.id, title: documents.title })
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .limit(1);

    if (!doc) {
      throw new AppError("DOCUMENT_NOT_FOUND", "الوثيقة غير موجودة", 404);
    }

    const rows = await this.db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.documentId, documentId))
      .orderBy(desc(documentAnalyses.createdAt));

    return {
      documentId: doc.id,
      documentTitle: doc.title,
      analyses: rows.map((row) => this.toResponse(row, doc.title)),
    };
  }

  async getLatest(userId: string, documentId: string) {
    const [doc] = await this.db
      .select({ id: documents.id, title: documents.title })
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .limit(1);

    if (!doc) {
      throw new AppError("DOCUMENT_NOT_FOUND", "الوثيقة غير موجودة", 404);
    }

    const [latest] = await this.db
      .select()
      .from(documentAnalyses)
      .where(eq(documentAnalyses.documentId, documentId))
      .orderBy(desc(documentAnalyses.createdAt))
      .limit(1);

    if (!latest) {
      throw new AppError("ANALYSIS_NOT_FOUND", "لا يوجد تحليل لهذه الوثيقة", 404);
    }

    return { analysis: this.toResponse(latest, doc.title) };
  }

  private parseAnalysisOutput(raw: string) {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError("ANALYSIS_PARSE_ERROR", "تعذر تحليل نتيجة الذكاء الاصطناعي", 502);
    }

    try {
      const data = JSON.parse(jsonMatch[0]);
      return analysisOutputSchema.parse(data);
    } catch {
      throw new AppError("ANALYSIS_PARSE_ERROR", "تعذر تحليل نتيجة الذكاء الاصطناعي", 502);
    }
  }

  private toResponse(row: typeof documentAnalyses.$inferSelect, documentTitle: string) {
    return {
      id: row.id,
      documentId: row.documentId,
      documentTitle,
      summary: row.summary,
      keyClauses: row.keyClauses,
      risks: row.risks,
      recommendations: row.recommendations,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
