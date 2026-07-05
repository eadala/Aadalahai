import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { ChatService } from "./chat.service.js";
import { RAGService } from "../rag/rag.service.js";
import { createSessionSchema, sendMessageSchema } from "./chat.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function chatRoutes(app: FastifyInstance) {
  const rag = new RAGService(app.db, app.ai.embedder, app.config);
  const service = new ChatService(app.db, app.ai.llm, rag);

  app.post("/sessions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = createSessionSchema.parse(request.body ?? {});
      const session = await service.createSession(request.user.sub, input.title);
      return reply.status(201).send({ session });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get("/sessions", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sessions = await service.listSessions(request.user.sub);
      return reply.status(200).send({ sessions });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get("/sessions/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const session = await service.getSession(request.user.sub, id);
      return reply.status(200).send({ session });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.delete("/sessions/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await service.deleteSession(request.user.sub, id);
      return reply.status(200).send({ message: "تم حذف الجلسة" });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post(
    "/sessions/:id/messages",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const input = sendMessageSchema.parse(request.body);

        if (input.stream) {
          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          for await (const event of service.streamMessage(
            request.user.sub,
            id,
            input.content
          )) {
            reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
          }
          reply.raw.write("data: [DONE]\n\n");
          reply.raw.end();
          return;
        }

        const result = await service.sendMessage(request.user.sub, id, input.content);
        return reply.status(200).send(result);
      } catch (error) {
        if (reply.raw.headersSent) {
          reply.raw.write(`data: ${JSON.stringify({ type: "error", message: String(error) })}\n\n`);
          reply.raw.end();
          return;
        }
        return handleError(error, reply);
      }
    }
  );
}

function handleError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    const details = error.issues.map((i) => ({
      field: i.path.join("."),
      issue: i.message,
    }));
    const appError = new AppError("VALIDATION_ERROR", "بيانات غير صالحة", 400, details);
    return reply.status(400).send(formatError(appError));
  }
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(formatError(error));
  }
  throw error;
}
