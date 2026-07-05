# ترحيل الإنتاج: adala-ai → Aadalahai على adalahai.com

> استبدال النشر الحالي (Replit + Clerk) بمكدس `Aadalahai` (Docker + JWT + Next.js)

## الخريطة

```
قبل:  adalahai.com → Replit (eadala/adala-ai) + Clerk + Vite
بعد:  adalahai.com → VPS Docker (eadala/Aadalahai) + Caddy + Next.js
```

## المتطلبات

- VPS (Hetzner أو غيره) مع Docker
- وصول SSH + sudo
- Cloudflare DNS لـ `adalahai.com`
- `OPENAI_API_KEY` للإنتاج

## الخطوة 1 — إيقاف التعارض

1. في **Replit**: أوقف/ألغِ نشر `adala-ai` أو أزل custom domain مؤقتاً
2. في **Coolify** (إن وُجد): أوقف تطبيق `adala-ai`
3. احتفظ بنسخة DB من النظام القديم إن لزم (اختياري)

## الخطوة 2 — نشر Aadalahai

```bash
git clone https://github.com/eadala/Aadalahai.git
cd Aadalahai
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
| `www` | CNAME | `adalahai.com` (أو A نفس IP) |

**أثناء أول شهادة HTTPS:** عطّل البروكسي (سحابة رمادية) لـ `adalahai.com` و `api.adalahai.com`  
**بعد النجاح:** فعّل البروكسي + SSL = Full (strict)

```bash
./scripts/verify-dns.sh adalahai.com api.adalahai.com YOUR_SERVER_IP
```

## الخطوة 4 — التحقق

```bash
curl https://api.adalahai.com/health
curl https://api.adalahai.com/ready
curl -I https://adalahai.com/login

API_URL=https://api.adalahai.com WEB_URL=https://adalahai.com npm run prod:smoke
```

متوقع: **19/19** smoke tests.

## الخطوة 5 — أرشفة adala-ai

1. أضف `README.md` في `eadala/adala-ai`: «مُستبدَل بـ Aadalahai — لا تنشر»
2. أوقف GitHub webhooks إلى Replit/Coolify
3. (اختياري) أعد توجيه مستودع `eadala/eadala` → `Aadalahai`

## ما لا يُرحّل تلقائياً

| القديم (adala-ai) | الجديد (Aadalahai) |
|---|---|
| مستخدمو Clerk | تسجيل JWT جديد |
| Stripe subscriptions | يحتاج تكامل لاحق |
| Cases module | Sprint مستقبلي |
| Ollama محلي | OpenAI (أو mock) |

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| شهادة Caddy فاشلة | DNS only مؤقتاً في Cloudflare |
| 502 على الويب | `docker compose logs web api caddy` |
| CORS errors | تأكد `CORS_ORIGINS` في `.env.prod` |
| www يعيد 503 | Caddy يعيد التوجيه تلقائياً بعد النشر |

## المراجع

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ADR-018](./ADR/018-adalahai-domain-migration.md)
