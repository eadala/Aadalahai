import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LegislationService } from "./legislation.service.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function legislationRoutes(app: FastifyInstance) {
  const service = new LegislationService(app.db, app.ai.embedder);

  app.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sources = await service.listSources();
      return reply.status(200).send({ sources, count: sources.length });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send(formatError(error));
      }
      throw error;
    }
  });
}
