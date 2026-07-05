/**
 * Shared smoke test suite for staging and production environments.
 */

export async function runSmokeTests({
  label = "smoke",
  apiUrl = "http://localhost:3001",
  webUrl = "http://localhost:3000",
  maxWaitMs = 120_000,
  emailPrefix = "smoke",
} = {}) {
  const API_URL = apiUrl.replace(/\/$/, "");
  const WEB_URL = webUrl.replace(/\/$/, "");

  let passed = 0;
  let failed = 0;

  const log = (msg) => console.log(`[${label}] ${msg}`);
  const fail = (msg) => {
    failed += 1;
    console.error(`[${label}] FAIL: ${msg}`);
  };
  const pass = (msg) => {
    passed += 1;
    log(`OK: ${msg}`);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

  async function waitForReady() {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
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
    fail(`API not ready after ${maxWaitMs}ms`);
    throw new Error("API not ready");
  }

  log(`API=${API_URL} WEB=${WEB_URL}`);

  {
    const { res, body } = await api("/health");
    if (res.ok && body?.status === "ok") pass("health");
    else fail(`health (${res.status})`);
  }

  await waitForReady();

  {
    const res = await fetch(`${API_URL}/metrics`);
    if (res.ok) pass("metrics");
    else fail(`metrics (${res.status})`);
  }

  const email = `${emailPrefix}-${Date.now()}@smoke.test`;
  const password = "SecurePass1";
  let accessToken = "";
  let refreshToken = "";

  {
    const { res, body } = await api("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name: "Smoke Test" }),
    });
    if (res.status === 201 && body?.tokens?.accessToken) {
      accessToken = body.tokens.accessToken;
      refreshToken = body.tokens.refreshToken;
      pass("register");
    } else {
      fail(`register (${res.status})`);
      throw new Error("Registration failed");
    }
  }

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

  {
    const { res, body } = await api("/api/v1/auth/me", { headers: auth });
    if (res.ok && body?.user?.email === email) pass("auth/me");
    else fail(`auth/me (${res.status})`);
  }

  {
    const { res, body } = await api("/api/v1/users/me", {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ name: "Smoke Updated" }),
    });
    if (res.ok && body?.user?.name === "Smoke Updated") pass("profile update");
    else fail(`profile (${res.status})`);
  }

  {
    const { res, body } = await api("/api/v1/documents", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        title: "وثيقة تجريبية",
        content: "المادة 77: يحق للعامل الحصول على إجازة سنوية مدفوعة الأجر.",
      }),
    });
    if (res.status === 201 && body?.document?.id) {
      pass("document upload");

      const docId = body.document.id;
      const analyzeRes = await api(`/api/v1/documents/${docId}/analyze`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({}),
      });
      if (analyzeRes.res.status === 201 && analyzeRes.body?.analysis?.summary) {
        pass("document analyze");
      } else {
        fail(`document analyze (${analyzeRes.res.status})`);
      }
    } else fail(`document upload (${res.status})`);
  }

  let sessionId = "";
  {
    const { res, body } = await api("/api/v1/chat/sessions", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ title: "جلسة smoke" }),
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

  {
    const { res, body } = await api("/api/v1/documents", { headers: auth });
    if (res.ok && Array.isArray(body?.documents)) pass("documents list");
    else fail(`documents list (${res.status})`);
  }

  {
    const { res, body } = await api("/api/v1/analytics/me", { headers: auth });
    if (res.ok && typeof body?.analytics?.totalSessions === "number") pass("analytics/me");
    else fail(`analytics/me (${res.status})`);
  }

  {
    const { res, body } = await api("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (res.ok && body?.tokens?.accessToken) pass("token refresh");
    else fail(`token refresh (${res.status})`);
  }

  {
    const res = await fetch(`${WEB_URL}/login`);
    if (res.ok) pass("web UI");
    else fail(`web UI (${res.status})`);
  }

  // HTTPS check when using https URLs
  if (API_URL.startsWith("https://")) {
    pass("API HTTPS");
  }
  if (WEB_URL.startsWith("https://")) {
    pass("Web HTTPS");
  }

  log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
  log("All smoke tests passed");
}
