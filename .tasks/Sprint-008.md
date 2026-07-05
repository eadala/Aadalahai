# Sprint-008 — Staging Deployment

**الفترة**: 2026-07-05  
**الهدف**: نشر بيئة Staging + اختبارات UAT  
**الحالة**: ✅ مكتمل

## المتطلبات السابقة ✅

- [x] دمج Sprint-001→007 في `main`
- [x] CI أخضر (52 API + 7 SDK + 4 E2E)

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `docker-compose.staging.yml` | ✅ |
| 2 | `.env.staging.example` | ✅ |
| 3 | `scripts/staging-smoke.mjs` (18 اختبار) | ✅ |
| 4 | GitHub Actions staging workflow | ✅ |
| 5 | `NEXT_PUBLIC_API_URL` build arg | ✅ |
| 6 | ADR-009 + docs | ✅ |

## التشغيل المحلي

```bash
cp .env.staging.example .env.staging
npm run staging:up
npm run staging:smoke
npm run staging:down
```

## CI

```bash
# يُشغَّل تلقائيًا عند push إلى main
# أو يدويًا: Actions → Staging → Run workflow
```

## الخطوة التالية

Sprint-009: Production deployment + domain + HTTPS
