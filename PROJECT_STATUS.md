# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-007 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني (بداية) |
| السبرنت الحالي | Sprint-008 (مخطط) |
| ADRs | 8 |
| API Tests | 52 ✅ |
| SDK Tests | 6 ✅ |
| E2E Tests | 4 ✅ |
| API Endpoints | 18 |
| Web Pages | 6 |

## Sprint-007 — OpenAI + Monitoring ✅

- OpenAI client مشترك (timeout, retry, error mapping)
- `/ready` + `/metrics` endpoints
- AI instrumentation (LLM, embedder, RAG latency)
- 12 اختبار جديد (factory, OpenAI, system)
- ADR-008

## التشغيل

```bash
# تطوير (mock)
docker compose up -d && npm install && npm run db:migrate
npm run dev:api && npm run dev:web

# OpenAI
LLM_PROVIDER=openai EMBEDDER_PROVIDER=openai OPENAI_API_KEY=sk-... npm run dev:api

# اختبارات
npm test           # 52 API + 6 SDK
npm run test:e2e   # 4 E2E
```

## الخطوة التالية

Sprint-008: Staging deploy + OpenAI smoke tests
