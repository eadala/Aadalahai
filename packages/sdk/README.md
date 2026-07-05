# @adalah/sdk

TypeScript SDK for the Adalah Legal AI API.

## Install

```bash
npm install @adalah/sdk
# or from monorepo:
npm install -w your-app @adalah/sdk
```

## Usage

```typescript
import { AdalahClient } from "@adalah/sdk";

const client = new AdalahClient({
  baseUrl: "http://localhost:3001",
  storage: {
    getAccessToken: () => localStorage.getItem("access"),
    getRefreshToken: () => localStorage.getItem("refresh"),
    setTokens: (a, r) => {
      localStorage.setItem("access", a);
      localStorage.setItem("refresh", r);
    },
    clearTokens: () => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    },
  },
});

// Auth
const { user, tokens } = await client.auth.login("lawyer@example.com", "SecurePass1");
client.setTokens(tokens);

// Chat with streaming
for await (const event of client.chat.streamMessage(sessionId, "ما هي المادة 77؟")) {
  if (event.type === "chunk") process.stdout.write(event.data.content);
}

// Documents
await client.documents.upload("نظام العمل", "المادة 77: ...");

// Legislation corpus + scoped search
const { sources } = await client.legislation.list();
const results = await client.search.query("محامٍ", { scope: "legislation", limit: 5 });
```

## API Coverage

| Module | Methods |
|---|---|
| `auth` | register, login, refresh, logout, me |
| `users` | getProfile, updateProfile |
| `chat` | createSession, listSessions, getSession, deleteSession, sendMessage, streamMessage |
| `documents` | upload, list, get, analyze, listAnalyses, getLatestAnalysis |
| `search` | query (scope: `all` \| `user` \| `legislation`) |
| `legislation` | list |
| `analytics` | me |
| `onboarding` | getStatus, completeLawyer |
| `system` | health, ready, metrics |
| `health` | check (legacy alias) |
