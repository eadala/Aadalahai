# ترحيل الإنتاج: Replit → Docker على `eadala/adala-ai`

> نفس المستودع `adala-ai` — استبدال الكود القديم (Replit + Clerk + Vite) بالمكدس الحالي (Docker + Next.js + JWT)

## المستودع الوحيد

| | القيمة |
|---|---|
| GitHub | [`eadala/adala-ai`](https://github.com/eadala/adala-ai) |
| النطاق | `adalahai.com` / `api.adalahai.com` |
| الاسم | `adalah-ai` (package.json) |

لا يوجد مستودع منفصل — كل التطوير والنشر من `adala-ai`.

## الخريطة

```
قبل:  adala-ai (main) → Replit + Clerk + Vite SPA
بعد:  adala-ai (main) → Docker + Caddy + Next.js + Fastify
```

النسخة القديمة محفوظة في tag: `legacy-replit-pre-cutover`

## المتطلبات

- VPS مع Docker
- Cloudflare DNS لـ `adalahai.com`
- `OPENAI_API_KEY`
- صلاحية **write** على `eadala/adala-ai` (لنشر الكود مرة واحدة)

## الخطوة 0 — نشر الكود إلى `adala-ai` (مرة واحدة)

الكود الحالي (Engineering OS) يُدفع إلى `main` في المستودع الوحيد:

```bash
chmod +x scripts/publish-to-adala-ai.sh
./scripts/publish-to-adala-ai.sh
```

أو من GitHub Actions (بعد إضافة secret `ADALA_AI_SYNC_TOKEN`):

`Actions → Publish to adala-ai → Run workflow` (اكتب `publish`)

يحفظ الكود القديم (Replit) في tag: `legacy-replit-pre-cutover`

## الخطوة 1 — إيقاف Replit

1. أوقف نشر Replit المرتبط بـ `adalahai.com`
2. أزل custom domain من Replit مؤقتاً

## الخطوة 2 — نشر من adala-ai

```bash
git clone https://github.com/eadala/adala-ai.git
cd adala-ai
cp .env.prod.adalahai.example .env.prod
# عدّل: JWT_SECRET, POSTGRES_PASSWORD, OPENAI_API_KEY
chmod +x scripts/*.sh
./scripts/cutover-adalahai.sh
```

## الخطوة 3 — DNS (Cloudflare)

| السجل | النوع | القيمة |
|---|---|---|
| `adalahai.com` | A | IP الخادم |
| `api.adalahai.com` | A | IP الخادم |

```bash
./scripts/verify-dns.sh adalahai.com api.adalahai.com YOUR_SERVER_IP
```

## الخطوة 4 — التحقق

```bash
curl https://api.adalahai.com/health
API_URL=https://api.adalahai.com WEB_URL=https://adalahai.com npm run prod:smoke
```

## ما لا يُرحّل

| القديم | الجديد |
|---|---|
| Clerk users | JWT تسجيل جديد |
| Stripe | لاحقاً |
| Cases module | sprint مستقبلي |

## المراجع

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ADR-018](./ADR/018-adalahai-domain-migration.md)
