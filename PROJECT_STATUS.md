# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-003 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 1 — النواة |
| السبرنت الحالي | Sprint-004 (مخطط) |
| الوثائق الهندسية | 48 / 100+ |
| ADRs | 5 |
| الميزات المكتملة | 3 |
| الاختبارات | 30 ✅ |
| API Endpoints | 14 |

## Sprint-003 — Chat + RAG ✅

| المهمة | الحالة |
|---|---|
| Chat sessions + messages | ✅ |
| Documents + chunks + pgvector | ✅ |
| RAG retrieval (top-5) | ✅ |
| LLM mock + OpenAI providers | ✅ |
| SSE streaming | ✅ |
| 15 اختبار جديد | ✅ |

## الميزات المكتملة

1. Engineering OS (Sprint-001)
2. Auth API (Sprint-002)
3. Chat + RAG (Sprint-003)

## Stack

| المكون | التقنية |
|---|---|
| API | Fastify + TypeScript |
| ORM | Drizzle |
| DB | PostgreSQL 16 + pgvector |
| LLM | Pluggable (mock / OpenAI) |
| RAG | pgvector cosine search |
| Tests | Vitest (30) |

## الخطوة التالية

Sprint-004: Chat UI (Next.js) + Arabic RTL
