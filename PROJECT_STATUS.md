# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-006 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 1 — النواة ✅ مكتملة |
| السبرنت الحالي | Sprint-007 (مخطط) |
| ADRs | 7 |
| API Tests | 40 ✅ |
| SDK Tests | 6 ✅ |
| E2E Tests | 4 ✅ |
| API Endpoints | 16 |
| Web Pages | 6 |
| Packages | `@adalah/sdk` |

## Sprint-006 — API SDK + Production Deploy ✅

- `@adalah/sdk` TypeScript client (auth, chat, documents, streaming)
- OpenAPI 3.1 spec (`.docs/API/openapi.yaml`)
- Dockerfiles للإنتاج (API + Web)
- `docker-compose.prod.yml` + `.env.prod.example`
- CI: build job + E2E job
- Web يستخدم SDK (dogfooding)
- ADR-007

## التشغيل

```bash
# تطوير
docker compose up -d && npm install && npm run db:migrate
npm run dev:api    # :3001
npm run dev:web    # :3000

# إنتاج
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# اختبارات
npm test           # 40 API + 6 SDK
npm run test:e2e   # 4 E2E
npm run build      # sdk → api → web
```

## الخطوة التالية

Sprint-007: OpenAI integration + monitoring
