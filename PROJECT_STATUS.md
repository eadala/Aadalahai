# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-002 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 1 — النواة (بدأت) |
| السبرنت الحالي | Sprint-003 (مخطط) |
| الوثائق الهندسية | 42 / 100+ |
| ADRs | 3 |
| الميزات المكتملة | 1 (Auth) |
| الاختبارات | 15 ✅ |
| الأخطاء المفتوحة | 0 |

## Sprint-002 — Auth + بيئة تطوير ✅

| المهمة | الحالة |
|---|---|
| Docker Compose (Postgres + Redis) | ✅ |
| CI pipeline (GitHub Actions) | ✅ |
| User model + migration (Drizzle) | ✅ |
| Auth API (5 endpoints) | ✅ |
| JWT middleware | ✅ |
| Auth tests (15) | ✅ |
| ADR-002 (tech stack) + ADR-003 (auth) | ✅ |
| API + Database docs | ✅ |

## Stack

| المكون | التقنية |
|---|---|
| API | Node.js 22 + TypeScript + Fastify |
| ORM | Drizzle |
| DB | PostgreSQL 16 |
| Cache | Redis 7 (Docker) |
| Auth | JWT + Refresh Token Rotation |
| Tests | Vitest (15 tests) |
| CI | GitHub Actions |

## القرارات

- [ADR-001](.docs/ADR/001-engineering-os.md): Engineering OS
- [ADR-002](.docs/ADR/002-tech-stack.md): Node.js + Fastify + Drizzle
- [ADR-003](.docs/ADR/003-auth-strategy.md): JWT + Refresh Rotation

## الخطوة التالية

Sprint-003: Chat sessions + RAG pipeline MVP
