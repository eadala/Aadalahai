# @adalah/api

Backend API service for Adalah platform.

## Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Docker (optional, for `docker compose`)

## Quick Start

```bash
# From repo root
cp .env.example .env

# Start Postgres + Redis
docker compose up -d

# Install & migrate
npm install
npm run db:migrate

# Dev server
npm run dev
# → http://localhost:3001
```

## Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | `/health` | No |
| POST | `/api/v1/auth/register` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/refresh` | No |
| POST | `/api/v1/auth/logout` | No |
| GET | `/api/v1/auth/me` | Bearer |
| POST | `/api/v1/chat/sessions` | Bearer |
| GET | `/api/v1/chat/sessions` | Bearer |
| GET | `/api/v1/chat/sessions/:id` | Bearer |
| DELETE | `/api/v1/chat/sessions/:id` | Bearer |
| POST | `/api/v1/chat/sessions/:id/messages` | Bearer |
| POST | `/api/v1/documents` | Bearer |
| GET | `/api/v1/documents` | Bearer |
| GET | `/api/v1/documents/:id` | Bearer |

See [.docs/API/](../../.docs/API/) for full documentation.

## Tests

```bash
npm test          # 15 tests
npm run lint      # TypeScript check
```

## Structure

```
src/
  config/       # Environment
  db/           # Drizzle schema + migrations
  lib/          # Shared utilities
  modules/
    auth/       # Auth service + routes
  app.ts        # Fastify app builder
  server.ts     # Entry point
tests/
  auth.test.ts  # Integration tests
```
