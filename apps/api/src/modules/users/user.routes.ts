import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { UserService } from "./user.service.js";
import { updateProfileSchema } from "./user.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

export async function userRoutes(app: FastifyInstance) {
  const service = new UserService(app.db);

  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await service.getProfile(request.user.sub);
      return reply.status(200).send({ user });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.patch("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = updateProfileSchema.parse(request.body);
      const user = await service.updateProfile(request.user.sub, input.name);
      return reply.status(200).send({ user });
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
