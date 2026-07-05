# Adalah AI — Engineering OS

> **عدالة** ليست مشروعًا يعتمد على prompts — بل منصة لها نظام تشغيل هندسي خاص.

## البدء السريع

1. اقرأ [.docs/Vision.md](.docs/Vision.md) لفهم الرؤية
2. راجع [.docs/Architecture.md](.docs/Architecture.md) للبنية
3. افتح Cursor — سيقرأ `.cursor/rules/` تلقائيًا
4. لأي ميزة جديدة: اتبع [.ai/Workflows/think-plan-build-review.md](.ai/Workflows/think-plan-build-review.md)

## هيكل المشروع

```
adalah-ai/
├── apps/
│   ├── api/        # Fastify backend
│   └── web/        # Next.js frontend (RTL Arabic)
├── packages/
│   └── sdk/        # @adalah/sdk TypeScript client
├── .docs/          # Knowledge Base
│   ├── Vision.md
│   ├── Roadmap.md
│   ├── Architecture.md
│   ├── ADR/
│   └── API/
├── .ai/            # العمليات والوكلاء
├── .tasks/         # العمل الجاري
├── .cursor/        # قواعد Cursor
├── docker/         # Dockerfiles للإنتاج
└── PROJECT_STATUS.md
```

## سير العمل

```
طلب ميزة → Think → Plan → Build → Review → دمج
```

## الحالة

راجع [PROJECT_STATUS.md](PROJECT_STATUS.md) للحالة الحالية.

## التشغيل المحلي

```bash
cp .env.example .env
docker compose up -d      # Postgres + Redis
npm install
npm run db:migrate
npm run dev:api           # API على http://localhost:3001
npm run dev:web           # Web على http://localhost:3000
npm test                  # 40 API + 6 SDK
npm run test:e2e          # 4 E2E
npm run build             # sdk → api → web
```

## النشر الإنتاجي

```bash
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Staging (UAT)

```bash
cp .env.staging.example .env.staging
npm run staging:up      # يبني ويشغّل Docker stack
npm run staging:smoke   # 12 اختبار تكامل
npm run staging:down    # إيقاف
```

يفعَّل تلقائيًا عبر GitHub Actions عند كل push إلى `main`.

## SDK

```typescript
import { AdalahClient } from "@adalah/sdk";

const client = new AdalahClient({ baseUrl: "http://localhost:3001" });

// Monitoring
await client.system.health();
await client.system.ready();

// Auth + Chat
await client.auth.login("user@example.com", "SecurePass1");
```

## OpenAI (إنتاج)

```bash
LLM_PROVIDER=openai
EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

راجع [packages/sdk/README.md](packages/sdk/README.md) و [`.docs/API/openapi.yaml`](.docs/API/openapi.yaml).

## الترخيص

TBD
