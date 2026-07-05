# Sprint-009 — Production Deployment + HTTPS

**الفترة**: 2026-07-05  
**الهدف**: نشر إنتاجي مع domain و HTTPS  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | Caddy reverse proxy + TLS | ✅ |
| 2 | `docker-compose.prod.https.yml` overlay | ✅ |
| 3 | `scripts/deploy-prod.sh` | ✅ |
| 4 | `scripts/production-smoke.mjs` | ✅ |
| 5 | CORS_ORIGINS + trustProxy | ✅ |
| 6 | GitHub Actions production workflow (manual) | ✅ |
| 7 | `.docs/DEPLOYMENT.md` + ADR-010 | ✅ |

## النشر السريع

```bash
cp .env.prod.example .env.prod
# عيّن DOMAIN, API_DOMAIN, ACME_EMAIL, JWT_SECRET, POSTGRES_PASSWORD
./scripts/deploy-prod.sh
npm run prod:smoke
```

## الخطوة التالية

Sprint-010: Prompt engineering عربي + OpenAI live validation
