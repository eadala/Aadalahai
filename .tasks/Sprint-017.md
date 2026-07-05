# Sprint-017 — adalahai.com Production Cutover

**الفترة**: 2026-07-05  
**الهدف**: نشر `eadala/adala-ai` على `adalahai.com` (نفس المستودع والاسم)  
**الحالة**: ✅ جاهز للتنفيذ على VPS

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `.env.prod.adalahai.example` | ✅ |
| 2 | `scripts/cutover-adalahai.sh` | ✅ |
| 3 | `scripts/verify-dns.sh` | ✅ |
| 4 | Caddy www redirect | ✅ |
| 5 | MIGRATION playbook + ADR-018 | ✅ |

## التنفيذ (يدوي على VPS)

```bash
cp .env.prod.adalahai.example .env.prod
./scripts/cutover-adalahai.sh
# ثم DNS + smoke على النطاق الحي
```

## الخطوة التالية

Sprint-018: نشر فعلي على VPS + smoke على https://adalahai.com
