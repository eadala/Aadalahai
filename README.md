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
# عدّل JWT_SECRET و POSTGRES_PASSWORD
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

الخدمات:
- Web: `http://localhost:3000`
- API: `http://localhost:3001`

## SDK

```typescript
import { AdalahClient } from "@adalah/sdk";

const client = new AdalahClient({
  baseUrl: process.env.ADALAH_API_URL ?? "http://localhost:3001",
});

const { tokens, user } = await client.auth.login("user@example.com", "SecurePass1");
const session = await client.chat.createSession("استشارة قانونية");

for await (const event of client.chat.streamMessage(session.session.id, "ما هي حقوق العامل؟")) {
  if (event.type === "token") process.stdout.write(event.content);
}
```

راجع [packages/sdk/README.md](packages/sdk/README.md) و [`.docs/API/openapi.yaml`](.docs/API/openapi.yaml).

## الترخيص

TBD
