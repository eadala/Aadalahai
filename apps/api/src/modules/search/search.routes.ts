import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { SearchService } from "./search.service.js";
import { searchQuerySchema } from "./search.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function searchRoutes(app: FastifyInstance) {
  const service = new SearchService(app.db, app.ai.embedder, app.config);

  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = searchQuerySchema.parse(request.query);
      const results = await service.search(request.user.sub, input.q, input.limit, input.scope);
      return reply.status(200).send({
        query: input.q,
        scope: input.scope,
        count: results.length,
        results,
      });
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
