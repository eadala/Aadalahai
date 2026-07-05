# Sprint-012 — Lawyer Dashboard Expansion + Document Analysis

**الفترة**: 2026-07-05  
**الهدف**: توسيع لوحة المحامين + تحليل الوثائق (MVP)  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | Migration `document_analyses` + schema | ✅ |
| 2 | `DocumentAnalysisService` + prompt | ✅ |
| 3 | `POST/GET .../documents/:id/analyze` | ✅ |
| 4 | Extend `GET /analytics/me` | ✅ |
| 5 | SDK + web UI (dashboard + documents) | ✅ |
| 6 | Tests + smoke extension | ✅ |
| 7 | ADR-013 + OpenAPI | ✅ |

## API Endpoints

| Method | Path | الوصف |
|---|---|---|
| POST | `/api/v1/documents/:id/analyze` | تحليل وثيقة |
| GET | `/api/v1/documents/:id/analyses` | قائمة التحليلات |
| GET | `/api/v1/analytics/me` | إحصائيات موسّعة |

## الاختبارات

```
API: 67 ✅ (+4)
SDK: 9 ✅ (+2)
E2E: 6 ✅ (+2)
Smoke: +2 (analyze, analytics)
```

## الخطوة التالية

Sprint-013: بحث تشريعات / تحسينات تحليل الوثائق
