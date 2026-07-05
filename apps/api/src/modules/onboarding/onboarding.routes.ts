import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { OnboardingService } from "./onboarding.service.js";
import { lawyerOnboardingSchema } from "./onboarding.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function onboardingRoutes(app: FastifyInstance) {
  const service = new OnboardingService(app.db);

  app.get("/status", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = await service.getStatus(request.user.sub);
      return reply.status(200).send(status);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post("/lawyer", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = lawyerOnboardingSchema.parse(request.body);
      const result = await service.completeLawyerOnboarding(request.user.sub, input);
      return reply.status(201).send(result);
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
