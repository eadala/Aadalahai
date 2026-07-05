# دليل النشر — عدالة

## البيئات

| البيئة | الملف | الأمر |
|---|---|---|
| Staging | `docker-compose.staging.yml` | `npm run staging:up` |
| Production | `docker-compose.prod.yml` | `./scripts/deploy-prod.sh` |

## النشر على VPS (Production + HTTPS)

### 0. ترحيل من adala-ai (adalahai.com)

إذا كنت تستبدل النشر القديم على `adalahai.com`:

```bash
cp .env.prod.adalahai.example .env.prod
# عدّل الأسرار
./scripts/cutover-adalahai.sh
```

راجع [.docs/MIGRATION-adala-ai-cutover.md](MIGRATION-adala-ai-cutover.md) للخطوات الكاملة (DNS, Cloudflare, إيقاف Replit).

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
DOMAIN=adalahai.com
WEB_DOMAIN=adalahai.com
API_DOMAIN=api.adalahai.com
ACME_EMAIL=admin@adalahai.com
NEXT_PUBLIC_API_URL=https://api.adalahai.com
CORS_ORIGINS=https://adalahai.com,https://www.adalahai.com
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
| `staging.yml` | push to main | Staging deploy + 19 smoke tests |
| `production.yml` | manual فقط | Production deploy + smoke |

## Smoke Tests (19)

يشمل: legislation RAG في المحادثة، corpus، scoped search، analytics، document analyze.

## Rollback

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod down
git checkout <previous-tag>
./scripts/deploy-prod.sh
```

## المراجع

- [MIGRATION-adala-ai-cutover.md](MIGRATION-adala-ai-cutover.md)
- [ADR-018](ADR/018-adalahai-domain-migration.md)
- [ADR-010](ADR/010-production-https.md)
- [deployment playbook](../.ai/Playbooks/deployment.md)
