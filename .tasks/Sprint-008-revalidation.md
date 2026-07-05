# Sprint-008 Revalidation — Post Sprint-015

**التاريخ**: 2026-07-05  
**الفرع**: `main` (بعد دمج PR #15)  
**الحالة**: ✅ Smoke محلي | ⚠️ Docker staging محلي (قيود بيئة)

## التحقق

| الخطوة | النتيجة |
|---|---|
| `npm run staging:smoke` (dev servers) | 18/18 ✅ |
| `docker compose ... up --wait` (محلي) | ⚠️ CONNECT_TIMEOUT بين الحاويات |
| GitHub Actions `staging.yml` | يُشغَّل تلقائيًا على `main` |

## سبب فشل Docker المحلي

قاعدة iptables في بيئة الـ VM:

```
-A DOCKER ! -i br-* -o br-* -j DROP
```

تمنع الاتصال بين حاويات `api` و`postgres` على نفس الشبكة (غير منشور للمضيف). Postgres يعمل (`pg_isready` ✅) لكن `wait-for-db.mjs` يفشل بـ `CONNECT_TIMEOUT`.

## الإصلاح المقترح (بيئة التطوير المحلية)

1. إعادة تهيئة Docker daemon مع bridge ICC مفعّل، أو
2. الاعتماد على GitHub Actions staging workflow للتحقق الكامل، أو
3. نشر منفذ postgres مؤقتًا في `.env.staging` للتطوير فقط

## Smoke المحدّث

- `legislation corpus` — `GET /api/v1/legislation`
- `legislation search` — `search?scope=legislation`
