# ADR-009: Staging Deployment Strategy

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-008

## السياق

بعد دمج Sprint-001→007 في `main`، نحتاج بيئة Staging تعكس الإنتاج لاختبار UAT قبل النشر الحقيقي.

## القرار

### 1. Staging = نسخة من Production topology
- `docker-compose.staging.yml` — نفس الخدمات (postgres, redis, api, web)
- قاعدة بيانات منفصلة: `adalah_staging`
- volumes ببادئة `staging_`

### 2. Health checks
- API healthcheck يستخدم `/ready` (وليس `/health` فقط)
- ينتظر migrations + DB قبل اعتبار الخدمة جاهزة

### 3. Smoke tests
- `scripts/staging-smoke.mjs` — 12 اختبار تكامل:
  - health, ready, metrics
  - register, login, me, profile
  - document upload, chat, refresh
  - web UI reachability

### 4. CI/CD
- `.github/workflows/staging.yml` — يُشغَّل عند:
  - push إلى `main`
  - `workflow_dispatch` (يدوي)
- يبني Docker stack → smoke tests → teardown

### 5. Web build
- `NEXT_PUBLIC_API_URL` كـ build arg في `Dockerfile.web`

## الترتيب التشغيلي

```
merge PRs → main → CI (test+e2e+build) → Staging workflow → UAT → Production
```

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| Staging على فرع قديم | لا يعكس الحالة الفعلية |
| Deploy بدون smoke tests | خطر أعطال غير مكتشفة |
| بيئة staging بدون Docker | لا تطابق production |

## العواقب

- يتطلب Docker على CI (GitHub Actions ✅)
- `npm run staging:up` للتشغيل المحلي
- Production يبقى `docker-compose.prod.yml` منفصل
