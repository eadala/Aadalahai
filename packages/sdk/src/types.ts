export interface LegalArticle {
  number: string;
  label: string;
  text: string;
}

export interface Citation {
  index: number;
  documentId: string;
  documentTitle: string;
  chunkContent: string;
  excerpt: string;
  similarity: number;
  confidence: "high" | "medium" | "low";
  articles: LegalArticle[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Document {
  id: string;
  title: string;
  status: string;
  contentPreview: string;
  chunkCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: Array<{ field: string; issue: string }>;
  };
}

export class AdalahApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details: ApiErrorBody["error"]["details"] = []
  ) {
    super(message);
    this.name = "AdalahApiError";
  }
}

export type StreamEvent =
  | { type: "user_message"; data: Message }
  | { type: "chunk"; data: { content: string } }
  | { type: "done"; data: { message: Message; citations: Citation[] } }
  | { type: "error"; message: string };

export interface TokenStorage {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string): void;
  clearTokens(): void;
}

export interface AdalahClientOptions {
  baseUrl: string;
  storage?: TokenStorage;
  fetch?: typeof fetch;
}
