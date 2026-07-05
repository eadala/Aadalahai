#!/usr/bin/env node
/**
 * Staging smoke tests — full integration UAT against a running stack.
 * Usage: API_URL=http://localhost:3001 node scripts/staging-smoke.mjs
 */

const API_URL = (process.env.API_URL ?? "http://localhost:3001").replace(/\/$/, "");
const WEB_URL = (process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");
const MAX_WAIT_MS = Number(process.env.STAGING_WAIT_MS ?? 120_000);

let passed = 0;
let failed = 0;

function log(msg) {
  console.log(`[staging-smoke] ${msg}`);
}

function fail(msg) {
  failed += 1;
  console.error(`[staging-smoke] FAIL: ${msg}`);
}

function pass(msg) {
  passed += 1;
  log(`OK: ${msg}`);
}

async function waitForReady() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${API_URL}/ready`);
      if (res.ok) {
        const body = await res.json();
        if (body.status === "ready" || body.status === "degraded") {
          pass(`ready (${body.status})`);
          return;
        }
      }
    } catch {
      // retry
    }
    await sleep(2000);
  }
  fail(`API not ready after ${MAX_WAIT_MS}ms`);
  throw new Error("Staging API not ready");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body };
}

async function run() {
  log(`API=${API_URL} WEB=${WEB_URL}`);

  // 1. Health
  {
    const { res, body } = await api("/health");
    if (res.ok && body?.status === "ok") pass("health");
    else fail(`health (${res.status})`);
  }

  // 2. Ready
  await waitForReady();

  // 3. Metrics
  {
    const res = await fetch(`${API_URL}/metrics`);
    if (res.ok) pass("metrics");
    else fail(`metrics (${res.status})`);
  }

  // 4. Register + auth flow
  const email = `staging-${Date.now()}@smoke.test`;
  const password = "SecurePass1";
  let accessToken = "";
  let refreshToken = "";

  {
    const { res, body } = await api("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name: "Staging Smoke" }),
    });
    if (res.status === 201 && body?.tokens?.accessToken) {
      accessToken = body.tokens.accessToken;
      refreshToken = body.tokens.refreshToken;
      pass("register");
    } else {
      fail(`register (${res.status})`);
      process.exit(1);
    }
  }

  // 5. Login
  {
    const { res, body } = await api("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok && body?.tokens?.accessToken) {
      accessToken = body.tokens.accessToken;
      pass("login");
    } else fail(`login (${res.status})`);
  }

  const auth = { Authorization: `Bearer ${accessToken}` };

  // 6. Me
  {
    const { res, body } = await api("/api/v1/auth/me", { headers: auth });
    if (res.ok && body?.user?.email === email) pass("auth/me");
    else fail(`auth/me (${res.status})`);
  }

  // 7. Profile
  {
    const { res, body } = await api("/api/v1/users/me", {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ name: "Staging Updated" }),
    });
    if (res.ok && body?.user?.name === "Staging Updated") pass("profile update");
    else fail(`profile (${res.status})`);
  }

  // 8. Upload document
  {
    const { res, body } = await api("/api/v1/documents", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        title: "وثيقة تجريبية",
        content: "المادة 77: يحق للعامل الحصول على إجازة سنوية مدفوعة الأجر.",
      }),
    });
    if (res.status === 201 && body?.document?.id) pass("document upload");
    else fail(`document upload (${res.status})`);
  }

  // 9. Chat session + message
  let sessionId = "";
  {
    const { res, body } = await api("/api/v1/chat/sessions", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ title: "جلسة staging" }),
    });
    if (res.status === 201 && body?.session?.id) {
      sessionId = body.session.id;
      pass("chat session create");
    } else fail(`chat session (${res.status})`);
  }

  if (sessionId) {
    const { res, body } = await api(`/api/v1/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ content: "ما هي حقوق العامل؟", stream: false }),
    });
    if (res.ok && body?.assistantMessage?.content) pass("chat message");
    else fail(`chat message (${res.status})`);
  }

  // 10. List documents
  {
    const { res, body } = await api("/api/v1/documents", { headers: auth });
    if (res.ok && Array.isArray(body?.documents)) pass("documents list");
    else fail(`documents list (${res.status})`);
  }

  // 11. Refresh token
  {
    const { res, body } = await api("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (res.ok && body?.tokens?.accessToken) pass("token refresh");
    else fail(`token refresh (${res.status})`);
  }

  // 12. Web UI reachable
  {
    const res = await fetch(`${WEB_URL}/login`);
    if (res.ok) pass("web UI");
    else fail(`web UI (${res.status})`);
  }

  log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
  log("All staging smoke tests passed");
}

run().catch((err) => {
  console.error("[staging-smoke] Fatal:", err.message);
  process.exit(1);
});
