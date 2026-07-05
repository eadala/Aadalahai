import type {
  ApiError,
  AuthTokens,
  ChatSession,
  Document,
  Message,
  StreamEvent,
  User,
} from "./types";
import { clearAuth, getAccessToken, getRefreshToken, saveAuth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
    auth = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (auth) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && auth) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request<T>(path, options, auth);
      }
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("UNAUTHORIZED");
    }

    const data = await response.json();
    if (!response.ok) {
      throw data as ApiError;
    }
    return data as T;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      saveAuth(data.tokens.accessToken, data.tokens.refreshToken, data.user);
      return true;
    } catch {
      return false;
    }
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ user: User; tokens: AuthTokens }>(
      "/api/v1/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      },
      false
    );
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; tokens: AuthTokens }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false
    );
  }

  async getMe() {
    return this.request<{ user: User }>("/api/v1/auth/me");
  }

  async getProfile() {
    return this.request<{ user: User }>("/api/v1/users/me");
  }

  async updateProfile(name: string) {
    return this.request<{ user: User }>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  }

  async createSession(title?: string) {
    return this.request<{ session: ChatSession }>("/api/v1/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  }

  async listSessions() {
    return this.request<{ sessions: ChatSession[] }>("/api/v1/chat/sessions");
  }

  async getSession(id: string) {
    return this.request<{ session: ChatSession }>(`/api/v1/chat/sessions/${id}`);
  }

  async deleteSession(id: string) {
    return this.request<{ message: string }>(`/api/v1/chat/sessions/${id}`, {
      method: "DELETE",
    });
  }

  async sendMessage(sessionId: string, content: string) {
    return this.request<{
      userMessage: Message;
      assistantMessage: Message;
    }>(`/api/v1/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content, stream: false }),
    });
  }

  async *streamMessage(
    sessionId: string,
    content: string
  ): AsyncGenerator<StreamEvent> {
    const token = getAccessToken();
    const response = await fetch(
      `${API_URL}/api/v1/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, stream: true }),
      }
    );

    if (!response.ok || !response.body) {
      throw new Error(`Stream failed: ${response.status}`);
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
          // skip malformed
        }
      }
    }
  }

  async uploadDocument(title: string, content: string) {
    return this.request<{ document: Document }>("/api/v1/documents", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  }

  async listDocuments() {
    return this.request<{ documents: Document[] }>("/api/v1/documents");
  }
}

export const api = new ApiClient();
