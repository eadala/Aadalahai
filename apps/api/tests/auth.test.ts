import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb } from "./helpers.js";

describe("Auth API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  const validUser = {
    email: "lawyer@example.com",
    password: "SecurePass1",
    name: "محامي تجريبي",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.user.email).toBe(validUser.email);
      expect(body.user.name).toBe(validUser.name);
      expect(body.user.role).toBe("user");
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
    });

    it("should reject duplicate email", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().error.code).toBe("EMAIL_EXISTS");
    });

    it("should reject weak password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: { ...validUser, password: "weak" },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: { ...validUser, email: "not-an-email" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });
    });

    it("should login with valid credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: validUser.email,
          password: validUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.user.email).toBe(validUser.email);
      expect(body.tokens.accessToken).toBeDefined();
    });

    it("should reject invalid password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: validUser.email,
          password: "WrongPass1",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should reject unknown email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/login",
        payload: {
          email: "unknown@example.com",
          password: validUser.password,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });
      refreshToken = res.json().tokens.refreshToken;
    });

    it("should refresh access token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.tokens.accessToken).toBeDefined();
      expect(body.tokens.refreshToken).toBeDefined();
      expect(body.tokens.refreshToken).not.toBe(refreshToken);
    });

    it("should reject reused refresh token (rotation)", async () => {
      await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken },
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid refresh token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken: "invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should logout and invalidate refresh token", async () => {
      const registerRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });
      const { refreshToken } = registerRes.json().tokens;

      const logoutRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/logout",
        payload: { refreshToken },
      });
      expect(logoutRes.statusCode).toBe(200);

      const refreshRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/refresh",
        payload: { refreshToken },
      });
      expect(refreshRes.statusCode).toBe(401);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return current user with valid token", async () => {
      const registerRes = await app.inject({
        method: "POST",
        url: "/api/v1/auth/register",
        payload: validUser,
      });
      const { accessToken } = registerRes.json().tokens;

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
        headers: { authorization: `Bearer ${accessToken}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user.email).toBe(validUser.email);
    });

    it("should reject request without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/me",
        headers: { authorization: "Bearer invalid-token" },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().status).toBe("ok");
    });
  });
});
