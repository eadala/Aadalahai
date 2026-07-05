import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { DocumentService } from "./document.service.js";
import { DocumentAnalysisService } from "./document-analysis.service.js";
import { createDocumentSchema } from "./document.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function documentRoutes(app: FastifyInstance) {
  const service = new DocumentService(app.db, app.ai.embedder, app.config);
  const analysisService = new DocumentAnalysisService(app.db, app.ai.llm);

  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = createDocumentSchema.parse(request.body);
      const doc = await service.create(request.user.sub, input.title, input.content);
      return reply.status(201).send({ document: doc });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const docs = await service.list(request.user.sub);
      return reply.status(200).send({ documents: docs });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const doc = await service.getById(request.user.sub, id);
      return reply.status(200).send({ document: doc });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post("/:id/analyze", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const analysis = await analysisService.analyze(request.user.sub, id);
      return reply.status(201).send({ analysis });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get("/:id/analyses", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await analysisService.listByDocument(request.user.sub, id);
      return reply.status(200).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
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
