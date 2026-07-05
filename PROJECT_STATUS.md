# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-005 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 1 — النواة ✅ مكتملة |
| السبرنت الحالي | Sprint-006 (مخطط) |
| ADRs | 6 |
| API Tests | 40 ✅ |
| E2E Tests | 4 ✅ |
| API Endpoints | 16 |
| Web Pages | 6 |

## Sprint-005 — Citations + UX ✅

- استشهادات قانونية موسّعة (مواد، ثقة، excerpt)
- User profile API + صفحة حسابي
- Auto session title
- Source warning + loading skeleton
- Citation UI expandable

## التشغيل

```bash
docker compose up -d && npm install && npm run db:migrate
npm run dev:api    # :3001
npm run dev:web    # :3000
```

## الخطوة التالية

Sprint-006: API SDK + production deploy
