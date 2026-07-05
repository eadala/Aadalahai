import { AdalahClient } from "@adalah/sdk";
import type {
  AuthTokens,
  ChatSession,
  Document,
  Message,
  StreamEvent,
  User,
} from "@adalah/sdk";
import { getAccessToken, getRefreshToken, saveAuth, clearAuth } from "./auth";

const client = new AdalahClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  storage: {
    getAccessToken,
    getRefreshToken,
    setTokens: (access, refresh) => {
      localStorage.setItem("adalah_access_token", access);
      localStorage.setItem("adalah_refresh_token", refresh);
    },
    clearTokens: clearAuth,
  },
});

export type { User, AuthTokens, Message, ChatSession, Document, StreamEvent, Citation, UserAnalytics, OnboardingStatus, LawyerOnboardingInput, DocumentAnalysis } from "@adalah/sdk";

export const api = {
  async register(email: string, password: string, name: string) {
    const result = await client.auth.register(email, password, name);
    saveAuth(result.tokens.accessToken, result.tokens.refreshToken, result.user);
    return result;
  },

  async login(email: string, password: string) {
    const result = await client.auth.login(email, password);
    saveAuth(result.tokens.accessToken, result.tokens.refreshToken, result.user);
    return result;
  },

  async getMe() {
    return client.auth.me();
  },

  async getProfile() {
    return client.users.getProfile();
  },

  async updateProfile(name: string) {
    return client.users.updateProfile(name);
  },

  createSession: (title?: string) => client.chat.createSession(title),
  listSessions: () => client.chat.listSessions(),
  getSession: (id: string) => client.chat.getSession(id),
  deleteSession: (id: string) => client.chat.deleteSession(id),
  sendMessage: (sessionId: string, content: string) =>
    client.chat.sendMessage(sessionId, content),
  streamMessage: (sessionId: string, content: string) =>
    client.chat.streamMessage(sessionId, content),
  uploadDocument: (title: string, content: string) =>
    client.documents.upload(title, content),
  listDocuments: () => client.documents.list(),

  analyzeDocument: (id: string) => client.documents.analyze(id),
  listDocumentAnalyses: (id: string) => client.documents.listAnalyses(id),

  getAnalytics: () => client.analytics.me(),
  getOnboardingStatus: () => client.onboarding.getStatus(),
  completeLawyerOnboarding: (input: {
    licenseNumber: string;
    specialization: string;
    barAssociation: string;
    phone?: string;
  }) => client.onboarding.completeLawyer(input),
};
