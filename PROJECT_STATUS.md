# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-015 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني |
| السبرنت الحالي | Sprint-016 (مخطط) |
| ADRs | 16 |
| API Tests | 73 ✅ |
| SDK Tests | 11 ✅ |
| E2E Tests | 7 ✅ |
| Smoke Tests | 18 ✅ |

## Sprint-015 — Legislation Corpus ✅

- جداول `legislation_sources` + `legislation_chunks`
- Seed تشريعات سعودية (نظام العمل، إجراءات جزائية)
- `GET /api/v1/legislation` + `search?scope=`
- Web: نطاقات بحث (الكل / التشريعات / وثائقي)
- ADR-016

## الخطوة التالية

Sprint-016: RAG من corpus التشريعات في المحادثة
