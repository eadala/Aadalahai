# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-008 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — Staging جاهز |
| الفرع الرئيسي | `main` (Sprint-001→007 مدمج) |
| السبرنت الحالي | Sprint-009 (مخطط) |
| ADRs | 9 |
| API Tests | 52 ✅ |
| SDK Tests | 7 ✅ |
| E2E Tests | 4 ✅ |
| Staging Smoke | 12 ✅ |

## Sprint-008 — Staging Deployment ✅

- `docker-compose.staging.yml` + `.env.staging.example`
- `scripts/staging-smoke.mjs` — 12 اختبار تكامل
- GitHub Actions staging workflow (push to main)
- ADR-009

## التشغيل

```bash
# تطوير
docker compose up -d && npm run db:migrate && npm run dev:api

# Staging
cp .env.staging.example .env.staging
npm run staging:up && npm run staging:smoke

# إنتاج (لاحقًا)
cp .env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## الخطوة التالية

Sprint-009: Production deployment + domain + HTTPS
