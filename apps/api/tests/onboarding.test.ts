import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { createTestApp, cleanupTestDb, registerTestUser } from "./helpers.js";

describe("Lawyer Onboarding API", () => {
  let app: FastifyInstance;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    const user = await registerTestUser(app);
    accessToken = user.accessToken;
  });

  const authHeaders = () => ({ authorization: `Bearer ${accessToken}` });

  it("GET /api/v1/onboarding/status should show pending onboarding", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/onboarding/status",
      headers: authHeaders(),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.role).toBe("user");
    expect(body.onboardingCompleted).toBe(false);
    expect(body.profile).toBeNull();
  });

  it("POST /api/v1/onboarding/lawyer should upgrade to lawyer", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/onboarding/lawyer",
      headers: authHeaders(),
      payload: {
        licenseNumber: "LIC-12345",
        specialization: "قانون العمل",
        barAssociation: "نقابة المحامين",
        phone: "0500000000",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.user.role).toBe("lawyer");
    expect(body.onboarding.onboardingCompleted).toBe(true);
    expect(body.onboarding.profile.licenseNumber).toBe("LIC-12345");
  });

  it("should reject duplicate onboarding", async () => {
    const payload = {
      licenseNumber: "LIC-99999",
      specialization: "قانون تجاري",
      barAssociation: "نقابة الرياض",
    };

    await app.inject({
      method: "POST",
      url: "/api/v1/onboarding/lawyer",
      headers: authHeaders(),
      payload,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/onboarding/lawyer",
      headers: authHeaders(),
      payload,
    });

    expect(response.statusCode).toBe(409);
  });
});
