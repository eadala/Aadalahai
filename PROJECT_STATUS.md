# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-012 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني |
| السبرنت الحالي | Sprint-013 (مخطط) |
| ADRs | 13 |
| API Tests | 67 ✅ |
| SDK Tests | 9 ✅ |
| E2E Tests | 6 ✅ |

## Sprint-012 — Dashboard Expansion + Document Analysis ✅

- جدول `document_analyses` + migration `0003`
- `POST /api/v1/documents/:id/analyze` — تحليل عقود ومستندات
- توسيع `GET /api/v1/analytics/me` (ملف محامٍ + نشاط أخير)
- Web: لوحة محسّنة + زر تحليل في الوثائق
- ADR-013

## OpenAI Live

```bash
OPENAI_API_KEY=sk-... npm run openai:smoke
```

## الخطوة التالية

Sprint-013: بحث تشريعات / تحسينات تحليل الوثائق
