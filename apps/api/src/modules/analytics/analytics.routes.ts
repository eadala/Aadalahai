import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AnalyticsService } from "./analytics.service.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function analyticsRoutes(app: FastifyInstance) {
  const service = new AnalyticsService(app.db);

  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analytics = await service.getUserAnalytics(request.user.sub);
      return reply.status(200).send({ analytics });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send(formatError(error));
      }
      throw error;
    }
  });
}
