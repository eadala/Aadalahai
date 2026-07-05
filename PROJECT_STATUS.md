# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-004 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 1 — النواة (شبه مكتملة) |
| السبرنت الحالي | Sprint-005 (مخطط) |
| الوثائق الهندسية | 50 / 100+ |
| ADRs | 5 |
| الميزات المكتملة | 5 |
| API Tests | 30 ✅ |
| E2E Tests | 3 ✅ |
| API Endpoints | 14 |
| Web Pages | 5 |

## Sprint-004 — Chat UI ✅

| المهمة | الحالة |
|---|---|
| Next.js 15 + Tailwind 4 | ✅ |
| Login / Register | ✅ |
| Chat UI + SSE streaming | ✅ |
| RTL عربي + Tajawal | ✅ |
| Documents upload UI | ✅ |
| Citations display | ✅ |
| Playwright E2E (3) | ✅ |

## Stack الكامل

| الطبقة | التقنية |
|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind 4 |
| Backend | Fastify + TypeScript + Drizzle |
| DB | PostgreSQL 16 + pgvector |
| AI | Pluggable LLM + RAG |
| Tests | Vitest (30) + Playwright (3) |

## التشغيل

```bash
docker compose up -d
npm install && npm run db:migrate
npm run dev:api    # :3001
npm run dev:web    # :3000
```

## الخطوة التالية

Sprint-005: تحسين citations + UX polish
