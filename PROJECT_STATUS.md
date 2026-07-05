# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-009 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — جاهز للإنتاج |
| الفرع الرئيسي | `main` |
| السبرنت الحالي | Sprint-010 (مخطط) |
| ADRs | 10 |
| API Tests | 54 ✅ |
| SDK Tests | 7 ✅ |
| E2E Tests | 4 ✅ |
| Smoke Tests | 13 (staging + production) |

## Sprint-009 — Production + HTTPS ✅

- Caddy reverse proxy + Let's Encrypt
- `scripts/deploy-prod.sh` (direct / https modes)
- `scripts/production-smoke.mjs`
- CORS_ORIGINS + trustProxy
- `.docs/DEPLOYMENT.md` + ADR-010

## النشر

```bash
# Staging
npm run staging:up && npm run staging:smoke

# Production (VPS + domain)
cp .env.prod.example .env.prod
./scripts/deploy-prod.sh
npm run prod:smoke
```

راجع [.docs/DEPLOYMENT.md](.docs/DEPLOYMENT.md) للتفاصيل.

## الخطوة التالية

Sprint-010: Prompt engineering عربي + OpenAI live validation
