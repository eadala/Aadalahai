# Sprint-014 — Staging + Production Deploy Validation

**الفترة**: 2026-07-05  
**الهدف**: نشر Sprints 011–013 على Staging و Production والتحقق  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | Staging deploy (Sprint 011–013 features) | ✅ |
| 2 | Staging smoke (16 اختبار) | ✅ |
| 3 | Production deploy (direct mode) | ✅ |
| 4 | Production smoke (16 اختبار) | ✅ |
| 5 | إصلاح production CI workflow (mock AI) | ✅ |
| 6 | `wait-for-db.mjs` + ADR-015 | ✅ |
| 7 | تحديث DEPLOYMENT.md + PROJECT_STATUS | ✅ |

## Smoke Tests (16)

health, ready, metrics, register, login, auth/me, profile, document upload, document analyze, chat session, chat message, documents list, analytics/me, legal search, token refresh, web UI

## الأوامر

```bash
# Staging
cp .env.staging.example .env.staging
npm run staging:up
npm run staging:smoke
npm run staging:down

# Production (محلي)
cp .env.prod.example .env.prod
# LLM_PROVIDER=mock للتحقق المحلي
./scripts/deploy-prod.sh
npm run prod:smoke
npm run prod:down
```

## الخطوة التالية

Sprint-015: corpus تشريعات خارجي أو OpenAI live على Staging
