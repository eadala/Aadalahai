import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import { AuthService } from "./auth.service.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "./auth.schema.js";
import { AppError, formatError } from "../../lib/errors.js";

function handleZodError(error: ZodError): AppError {
  const details = error.issues.map((issue) => ({
    field: issue.path.join("."),
    issue: issue.message,
  }));
  return new AppError("VALIDATION_ERROR", "بيانات غير صالحة", 400, details);
}

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(
    app.db,
    app.config,
    (payload) => app.jwt.sign(payload)
  );

  app.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAuthError(error, reply);
    }
  });

  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);
      return reply.status(200).send(result);
    } catch (error) {
      return handleAuthError(error, reply);
    }
  });

  app.post("/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = refreshSchema.parse(request.body);
      const result = await authService.refresh(input.refreshToken);
      return reply.status(200).send(result);
    } catch (error) {
      return handleAuthError(error, reply);
    }
  });

  app.post("/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = logoutSchema.parse(request.body);
      await authService.logout(input.refreshToken);
      return reply.status(200).send({ message: "تم تسجيل الخروج" });
    } catch (error) {
      return handleAuthError(error, reply);
    }
  });

  app.get(
    "/me",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user.sub;
        const user = await authService.getMe(userId);
        return reply.status(200).send({ user });
      } catch (error) {
        return handleAuthError(error, reply);
      }
    }
  );
}

function handleAuthError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    const appError = handleZodError(error);
    return reply.status(appError.statusCode).send(formatError(appError));
  }
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(formatError(error));
  }
  throw error;
}
