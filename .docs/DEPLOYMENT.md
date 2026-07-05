# دليل النشر — عدالة

## البيئات

| البيئة | الملف | الأمر |
|---|---|---|
| Staging | `docker-compose.staging.yml` | `npm run staging:up` |
| Production | `docker-compose.prod.yml` | `./scripts/deploy-prod.sh` |

## النشر على VPS (Production + HTTPS)

### 1. المتطلبات

- VPS مع Docker و Docker Compose
- Domain يشير إلى IP الخادم (A records):
  - `adalah.example.com` → WEB
  - `api.adalah.example.com` → API
- Ports 80 و 443 مفتوحة

### 2. الإعداد

```bash
git clone https://github.com/eadala/Aadalahai.git
cd Aadalahai
cp .env.prod.example .env.prod
```

عدّل `.env.prod`:

```bash
DOMAIN=adalah.example.com
WEB_DOMAIN=adalah.example.com
API_DOMAIN=api.adalah.example.com
ACME_EMAIL=admin@adalah.example.com
NEXT_PUBLIC_API_URL=https://api.adalah.example.com
CORS_ORIGINS=https://adalah.example.com
JWT_SECRET=<random-64-chars>
POSTGRES_PASSWORD=<strong-password>
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai
EMBEDDER_PROVIDER=openai
```

### 3. النشر

```bash
chmod +x scripts/deploy-prod.sh
./scripts/deploy-prod.sh
npm run prod:smoke
```

### 4. التحقق

```bash
curl https://api.adalah.example.com/health
curl https://api.adalah.example.com/ready
curl -I https://adalah.example.com/login
```

## النشر المحلي (بدون Domain)

```bash
cp .env.prod.example .env.prod
# اترك DOMAIN فارغًا
./scripts/deploy-prod.sh
npm run prod:smoke
```

## CI/CD

| Workflow | التشغيل | الغرض |
|---|---|---|
| `ci.yml` | push/PR | اختبارات + build |
| `staging.yml` | push to main | Staging smoke |
| `production.yml` | manual فقط | Production smoke على CI |

## Rollback

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod down
git checkout <previous-tag>
./scripts/deploy-prod.sh
```

## المراجع

- [ADR-010](ADR/010-production-https.md)
- [deployment playbook](../.ai/Playbooks/deployment.md)
