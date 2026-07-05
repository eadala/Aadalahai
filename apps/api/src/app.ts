import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import type { FastifyRequest, FastifyReply } from "fastify";
import type { Env } from "./config/env.js";
import { createDb, type Database } from "./db/index.js";
import { createAIProviders, type AIProviders } from "./ai/factory.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { chatRoutes } from "./modules/chat/chat.routes.js";
import { documentRoutes } from "./modules/documents/document.routes.js";
import { userRoutes } from "./modules/users/user.routes.js";
import { AppError, formatError } from "./lib/errors.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    config: Env;
    ai: AIProviders;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string };
    user: { sub: string; email: string; role: string };
  }
}

export async function buildApp(env: Env) {
  const app = Fastify({
    logger: env.NODE_ENV !== "test",
  });

  const db = createDb(env.DATABASE_URL);
  const ai = createAIProviders(env);

  app.decorate("config", env);
  app.decorate("db", db);
  app.decorate("ai", ai);

  await app.register(cors, { origin: true });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "غير مصرح",
            details: [],
          },
        });
      }
    }
  );

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(formatError(error));
    }
    app.log.error(error);
    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "خطأ داخلي في الخادم",
        details: [],
      },
    });
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "adalah-api",
    timestamp: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: "/api/v1/auth" });

  await app.register(
    async (protectedRoutes) => {
      protectedRoutes.addHook("preHandler", app.authenticate);
      await protectedRoutes.register(chatRoutes, { prefix: "/api/v1/chat" });
      await protectedRoutes.register(documentRoutes, { prefix: "/api/v1/documents" });
      await protectedRoutes.register(userRoutes, { prefix: "/api/v1/users" });
    }
  );

  return app;
}
