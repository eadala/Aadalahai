# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-013 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني |
| السبرنت الحالي | Sprint-014 (مخطط) |
| ADRs | 14 |
| API Tests | 71 ✅ |
| SDK Tests | 10 ✅ |
| E2E Tests | 7 ✅ |

## Sprint-013 — Hybrid Legal Search ✅

- `GET /api/v1/search` — بحث هجين (vector + keyword)
- `GET /documents/:id/analyses/latest` — آخر تحليل
- Web: `/search` — واجهة البحث القانوني
- ADR-014

## OpenAI Live

```bash
OPENAI_API_KEY=sk-... npm run openai:smoke
```

## الخطوة التالية

Sprint-014: corpus تشريعات خارجي / نشر Staging→Production
