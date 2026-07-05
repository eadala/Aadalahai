import {
  AdalahApiError,
  type AdalahClientOptions,
  type ApiErrorBody,
  type AuthTokens,
  type StreamEvent,
  type TokenStorage,
  type User,
} from "./types.js";

export class AdalahClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly storage?: TokenStorage;

  constructor(options: AdalahClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetchFn = options.fetch ?? ((input, init) => globalThis.fetch(input, init));
    this.storage = options.storage;
  }

  readonly auth = {
    register: (email: string, password: string, name: string) =>
      this.post<{ user: User; tokens: AuthTokens }>("/api/v1/auth/register", {
        email,
        password,
        name,
      }, false),

    login: (email: string, password: string) =>
      this.post<{ user: User; tokens: AuthTokens }>("/api/v1/auth/login", {
        email,
        password,
      }, false),

    refresh: (refreshToken: string) =>
      this.post<{ user: User; tokens: AuthTokens }>("/api/v1/auth/refresh", {
        refreshToken,
      }, false),

    logout: (refreshToken: string) =>
      this.post<{ message: string }>("/api/v1/auth/logout", { refreshToken }, false),

    me: () => this.get<{ user: User }>("/api/v1/auth/me"),
  };

  readonly users = {
    getProfile: () => this.get<{ user: User }>("/api/v1/users/me"),
    updateProfile: (name: string) =>
      this.patch<{ user: User }>("/api/v1/users/me", { name }),
  };

  readonly chat = {
    createSession: (title?: string) =>
      this.post<{ session: import("./types.js").ChatSession }>("/api/v1/chat/sessions", { title }),

    listSessions: () =>
      this.get<{ sessions: import("./types.js").ChatSession[] }>("/api/v1/chat/sessions"),

    getSession: (id: string) =>
      this.get<{ session: import("./types.js").ChatSession }>(`/api/v1/chat/sessions/${id}`),

    deleteSession: (id: string) =>
      this.delete<{ message: string }>(`/api/v1/chat/sessions/${id}`),

    sendMessage: (sessionId: string, content: string) =>
      this.post<{
        userMessage: import("./types.js").Message;
        assistantMessage: import("./types.js").Message;
      }>(`/api/v1/chat/sessions/${sessionId}/messages`, { content, stream: false }),

    streamMessage: (sessionId: string, content: string) =>
      this.stream(`/api/v1/chat/sessions/${sessionId}/messages`, { content, stream: true }),
  };

  readonly documents = {
    upload: (title: string, content: string) =>
      this.post<{ document: import("./types.js").Document }>("/api/v1/documents", {
        title,
        content,
      }),

    list: () => this.get<{ documents: import("./types.js").Document[] }>("/api/v1/documents"),

    get: (id: string) =>
      this.get<{ document: import("./types.js").Document }>(`/api/v1/documents/${id}`),
  };

  readonly health = {
    check: () => this.get<{ status: string; service: string }>("/health", false),
  };

  readonly system = {
    health: () => this.get<{ status: string; service: string; timestamp: string }>("/health", false),
    ready: () =>
      this.get<{
        status: string;
        service: string;
        checks: Record<string, { status: string; latencyMs?: number; provider?: string }>;
        timestamp: string;
      }>("/ready", false),
    metrics: () => this.getText("/metrics", false),
  };

  setTokens(tokens: AuthTokens) {
    this.storage?.setTokens(tokens.accessToken, tokens.refreshToken);
  }

  clearTokens() {
    this.storage?.clearTokens();
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    auth = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (auth && this.storage) {
      const token = this.storage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && auth && this.storage) {
      const refreshed = await this.tryRefresh();
      if (refreshed) return this.request<T>(path, options, auth);
      this.storage.clearTokens();
    }

    const data = await response.json();
    if (!response.ok) {
      const err = data as ApiErrorBody;
      throw new AdalahApiError(
        err.error?.code ?? "UNKNOWN",
        err.error?.message ?? "Request failed",
        response.status,
        err.error?.details ?? []
      );
    }
    return data as T;
  }

  private get<T>(path: string, auth = true) {
    return this.request<T>(path, { method: "GET" }, auth);
  }

  private async getText(path: string, auth = true): Promise<string> {
    const headers: Record<string, string> = {};
    if (auth && this.storage) {
      const token = this.storage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.fetchFn(`${this.baseUrl}${path}`, { method: "GET", headers });
    const text = await response.text();
    if (!response.ok) {
      throw new AdalahApiError("REQUEST_FAILED", text || "Request failed", response.status);
    }
    return text;
  }

  private post<T>(path: string, body: unknown, auth = true) {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(body) }, auth);
  }

  private patch<T>(path: string, body: unknown) {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  private delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.storage) return false;
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await this.auth.refresh(refreshToken);
      this.storage.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  private async *stream(path: string, body: unknown): AsyncGenerator<StreamEvent> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.storage) {
      const token = this.storage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new AdalahApiError("STREAM_ERROR", `Stream failed: ${response.status}`, response.status);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as StreamEvent;
        } catch {
          // skip
        }
      }
    }
  }
}
