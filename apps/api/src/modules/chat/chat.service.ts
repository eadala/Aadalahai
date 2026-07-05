import { eq, desc, and } from "drizzle-orm";
import type { Database } from "../../db/index.js";
import { chatSessions, messages } from "../../db/schema.js";
import type { LLMProvider, LLMMessage } from "../../ai/types.js";
import { RAGService } from "../rag/rag.service.js";
import { buildLegalSystemPrompt } from "../../ai/prompts/legal-assistant.js";
import { AppError } from "../../lib/errors.js";

export class ChatService {
  constructor(
    private readonly db: Database,
    private readonly llm: LLMProvider,
    private readonly rag: RAGService
  ) {}

  async createSession(userId: string, title?: string) {
    const [session] = await this.db
      .insert(chatSessions)
      .values({ userId, title: title ?? "محادثة جديدة" })
      .returning();

    return this.toSessionResponse(session, []);
  }

  async listSessions(userId: string) {
    const sessions = await this.db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));

    return sessions.map((s) => this.toSessionResponse(s));
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.getSessionForUser(userId, sessionId);
    const msgs = await this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);

    return this.toSessionResponse(session, msgs);
  }

  async deleteSession(userId: string, sessionId: string) {
    await this.getSessionForUser(userId, sessionId);
    await this.db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
  }

  async sendMessage(userId: string, sessionId: string, content: string) {
    const session = await this.getSessionForUser(userId, sessionId);

    const [userMessage] = await this.db
      .insert(messages)
      .values({ sessionId, role: "user", content })
      .returning();

    const history = await this.getLLMHistory(sessionId);
    const chunks = await this.rag.retrieve(userId, content);
    const context = this.rag.buildContext(chunks);
    const citations = this.rag.toCitations(chunks, content);

    const systemPrompt = this.buildSystemPrompt(context, citations);

    const assistantContent = await this.llm.complete(history, { systemPrompt });

    const [assistantMessage] = await this.db
      .insert(messages)
      .values({
        sessionId,
        role: "assistant",
        content: assistantContent,
        citations,
      })
      .returning();

    await this.db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, session.id));

    await this.maybeUpdateSessionTitle(session, content);

    return {
      userMessage: this.toMessageResponse(userMessage),
      assistantMessage: this.toMessageResponse(assistantMessage),
    };
  }

  async *streamMessage(userId: string, sessionId: string, content: string) {
    const session = await this.getSessionForUser(userId, sessionId);

    const [userMessage] = await this.db
      .insert(messages)
      .values({ sessionId, role: "user", content })
      .returning();

    yield { type: "user_message" as const, data: this.toMessageResponse(userMessage) };

    const history = await this.getLLMHistory(sessionId);
    const chunks = await this.rag.retrieve(userId, content);
    const context = this.rag.buildContext(chunks);
    const citations = this.rag.toCitations(chunks, content);

    const systemPrompt = this.buildSystemPrompt(context, citations);

    let fullContent = "";
    for await (const chunk of this.llm.stream(history, { systemPrompt })) {
      fullContent += chunk;
      yield { type: "chunk" as const, data: { content: chunk } };
    }

    const [assistantMessage] = await this.db
      .insert(messages)
      .values({
        sessionId,
        role: "assistant",
        content: fullContent,
        citations,
      })
      .returning();

    await this.db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, session.id));

    await this.maybeUpdateSessionTitle(session, content);

    yield {
      type: "done" as const,
      data: {
        message: this.toMessageResponse(assistantMessage),
        citations,
      },
    };
  }

  private buildSystemPrompt(context: string, citations: import("../../db/schema.js").Citation[]) {
    return buildLegalSystemPrompt({ context, citations });
  }

  private async maybeUpdateSessionTitle(
    session: typeof chatSessions.$inferSelect,
    firstMessage: string
  ) {
    if (session.title !== "محادثة جديدة") return;

    const title = firstMessage.slice(0, 60).trim() + (firstMessage.length > 60 ? "..." : "");
    await this.db
      .update(chatSessions)
      .set({ title, updatedAt: new Date() })
      .where(eq(chatSessions.id, session.id));
  }

  private async getSessionForUser(userId: string, sessionId: string) {
    const [session] = await this.db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)))
      .limit(1);

    if (!session) {
      throw new AppError("SESSION_NOT_FOUND", "الجلسة غير موجودة", 404);
    }

    return session;
  }

  private async getLLMHistory(sessionId: string): Promise<LLMMessage[]> {
    const msgs = await this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt);

    return msgs
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
  }

  private toSessionResponse(
    session: typeof chatSessions.$inferSelect,
    msgs?: (typeof messages.$inferSelect)[]
  ) {
    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messages: msgs?.map((m) => this.toMessageResponse(m)),
    };
  }

  private toMessageResponse(message: typeof messages.$inferSelect) {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      citations: message.citations ?? [],
      createdAt: message.createdAt.toISOString(),
    };
  }
}
