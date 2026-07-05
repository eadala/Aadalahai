# ADR-010: Production Deployment with HTTPS

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-009

## السياق

بعد Staging UAT، نحتاج نشر إنتاجي مع domain و HTTPS على VPS.

## القرار

### 1. Caddy كـ Reverse Proxy
- TLS تلقائي عبر Let's Encrypt
- Security headers (HSTS, X-Frame-Options, etc.)
- `docker/Caddyfile` + `docker-compose.prod.https.yml` overlay

### 2. وضعان للنشر

| الوضع | متى | الملفات |
|---|---|---|
| **direct** | محلي / بدون domain | `docker-compose.prod.yml` |
| **https** | VPS + domain | prod.yml + prod.https.yml |

`scripts/deploy-prod.sh` يختار الوضع تلقائياً حسب `DOMAIN`.

### 3. Subdomain architecture
- `adalah.example.com` → Web (Next.js)
- `api.adalah.example.com` → API (Fastify)

### 4. أمان
- `CORS_ORIGINS` — تقييد origins في الإنتاج
- `trustProxy: true` على Fastify خلف Caddy
- JWT_SECRET و POSTGRES_PASSWORD إلزاميان

### 5. Smoke tests
- `scripts/production-smoke.mjs` — نفس 13+ اختبار staging
- GitHub Actions `production.yml` — يدوي فقط (`workflow_dispatch`)

## DNS المطلوب

```
A  adalah.example.com     → VPS_IP
A  api.adalah.example.com → VPS_IP
```

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| Nginx + Certbot | Caddy أبسط مع ACME مدمج |
| نشر بدون HTTPS | غير مقبول للإنتاج |
| Auto-deploy prod on push | خطر عالي — يدوي فقط |

## العواقب

- `NEXT_PUBLIC_API_URL` يجب ضبطه قبل build الـ web image
- تغيير domain يتطلب إعادة build للـ web
- Production workflow لا ينشر على VPS حقيقي — يختبر stack على CI فقط
