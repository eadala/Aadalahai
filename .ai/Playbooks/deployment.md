# Playbook: النشر (Deployment)

## البيئات

| البيئة | الغرض | URL | Compose |
|---|---|---|---|
| dev | تطوير محلي | localhost:3000/3001 | `docker-compose.yml` |
| staging | UAT قبل الإنتاج | localhost (أو VPS) | `docker-compose.staging.yml` |
| prod | الإنتاج | TBD | `docker-compose.prod.yml` |

## الترتيب الصحيح

```
1. مراجعة PRs → دمج في main
2. CI أخضر (test + e2e + build)
3. Staging deploy + smoke tests
4. UAT يدوي على Staging
5. Production deploy (بعد موافقة)
```

## خطوات النشر

### 1. Pre-deploy

- [ ] كل الاختبارات خضراء على `main`
- [ ] PRs مدمجة (لا فروع تجريبية)
- [ ] Migration tested على staging

### 2. Deploy to Staging

```bash
cp .env.staging.example .env.staging
npm run staging:up
npm run staging:smoke
```

- [ ] Smoke tests تمر (12 اختبار)
- [ ] UAT يدوي: تسجيل، محادثة، وثائق، ملف شخصي
- [ ] `/ready` و `/metrics` يعملان

### 3. Deploy to Production

```bash
cp .env.prod.example .env.prod
# عيّن DOMAIN, JWT_SECRET, POSTGRES_PASSWORD, OPENAI_API_KEY
./scripts/deploy-prod.sh
npm run prod:smoke
```

- [ ] DNS يشير إلى VPS (A records)
- [ ] HTTPS يعمل (Caddy + Let's Encrypt)
- [ ] Smoke tests تمر
- [ ] مراقبة 30 دقيقة

راجع [.docs/DEPLOYMENT.md](../../.docs/DEPLOYMENT.md).

### 4. Post-deploy

- [ ] تحديث PROJECT_STATUS
- [ ] مراقبة metrics

## Rollback

1. `docker compose down` + restore previous images
2. سجّل في Bugs.md
3. حلل السبب

## المراجع

- [ADR-009](../.docs/ADR/009-staging-deployment.md)
- [.ai/Agents/devops-engineer.md](../Agents/devops-engineer.md)
