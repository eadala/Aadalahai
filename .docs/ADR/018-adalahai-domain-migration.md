# ADR-018: Migration من adala-ai إلى Aadalahai على adalahai.com

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect  

## السياق

| | `eadala/adala-ai` (قديم) | `eadala/Aadalahai` (جديد) |
|---|---|---|
| النطاق | `adalahai.com` (Replit) | غير مربوط بعد |
| الواجهة | Vite SPA | Next.js 15 |
| المصادقة | Clerk | JWT |
| الدفع | Stripe | — (لاحقاً) |
| النشر | Replit / Coolify / Hetzner | Docker + Caddy |

## القرار

**استبدال النشر** (ليس دمج الكود الكامل في مرحلة واحدة):

1. نشر `Aadalahai` على VPS بنفس النطاق
2. إيقاف `adala-ai` على Replit بعد التحقق
3. أرشفة `adala-ai` كمرجع للميزات المستقبلية (Cases, Stripe, Clerk)

## البنية المستهدفة

```
adalahai.com      → Caddy → Next.js (web)
api.adalahai.com  → Caddy → Fastify (api)
www               → redirect → apex
```

## Cloudflare

- A records → IP الخادم الجديد
- أثناء إصدار شهادة Let's Encrypt: DNS only (رمادي) مؤقتاً
- بعد النشر: SSL mode = Full (strict)

## الملفات

- `.env.prod.adalahai.example`
- `scripts/cutover-adalahai.sh`
- `scripts/verify-dns.sh`
- `.docs/MIGRATION-adala-ai-cutover.md`

## العواقب

- مستخدمو Clerk القديمون يحتاجون إعادة تسجيل (لا ترحيل تلقائي لـ JWT)
- بيانات PostgreSQL القديمة لا تُدمج تلقائياً
- Smoke 19 يتحقق من التشريعات + RAG في المحادثة

## المراجع

- [ADR-010](./010-production-https.md)
- [MIGRATION-adala-ai-cutover.md](../MIGRATION-adala-ai-cutover.md)
