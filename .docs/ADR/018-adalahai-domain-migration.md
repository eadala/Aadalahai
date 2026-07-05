# ADR-018: ترقية adala-ai — نفس المستودع والنطاق

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  

## السياق

`adalahai.com` مربوط بـ `eadala/adala-ai` (Replit). المكدس الجديد (Sprint 001–017) يُنشر على **نفس المستودع** `adala-ai` — بدون fork أو repo ثانٍ.

## القرار

1. استبدال `main` في `eadala/adala-ai` بالكود الحالي (Engineering OS)
2. حفظ الكود القديم في tag `legacy-replit-pre-cutover`
3. النشر عبر Docker + Caddy على VPS

## لا نفعل

- ❌ مستودع `Aadalahai` منفصل للإنتاج
- ❌ دمج Clerk/Stripe في مرحلة واحدة

## البنية

```
adalahai.com      → Caddy → Next.js
api.adalahai.com  → Caddy → Fastify
```

## المراجع

- [MIGRATION-adala-ai-cutover.md](../MIGRATION-adala-ai-cutover.md)
