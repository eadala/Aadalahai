# Sprint-006 — API SDK + Production Deploy

**الفترة**: 2026-07-05  
**الهدف**: SDK للمطورين + نشر إنتاجي  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `@adalah/sdk` TypeScript package | ✅ |
| 2 | OpenAPI 3.1 spec | ✅ |
| 3 | Dockerfiles (API + Web) | ✅ |
| 4 | docker-compose.prod.yml | ✅ |
| 5 | CI build + E2E jobs | ✅ |
| 6 | Web يستخدم SDK (dogfooding) | ✅ |
| 7 | ADR-007 | ✅ |
| 8 | إصلاح fetch binding في SDK للمتصفح | ✅ |

## التشغيل الإنتاجي

```bash
cp .env.prod.example .env.prod
# عدّل JWT_SECRET و POSTGRES_PASSWORD
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## SDK

```typescript
import { AdalahClient } from "@adalah/sdk";

const client = new AdalahClient({ baseUrl: "http://localhost:3001" });
await client.auth.login("user@example.com", "SecurePass1");
```

## الخطوة التالية

Sprint-007: OpenAI integration + monitoring
