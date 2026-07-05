# Sprint-013 — Hybrid Legal Search + Analysis Improvements

**الفترة**: 2026-07-05  
**الهدف**: بحث تشريعات في الوثائق + تحسين تحليل الوثائق  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `SearchService` (hybrid vector + keyword) | ✅ |
| 2 | `GET /api/v1/search` | ✅ |
| 3 | `GET /documents/:id/analyses/latest` | ✅ |
| 4 | SDK `search.query()` | ✅ |
| 5 | Web `/search` page + sidebar link | ✅ |
| 6 | 4 API tests + 1 E2E + smoke | ✅ |
| 7 | ADR-014 + OpenAPI | ✅ |

## API Endpoints

| Method | Path | الوصف |
|---|---|---|
| GET | `/api/v1/search?q=` | بحث هجين في الوثائق |
| GET | `/api/v1/documents/:id/analyses/latest` | آخر تحليل |

## الاختبارات

```
API: 71 ✅ (+4)
SDK: 10 ✅ (+1)
E2E: 7 ✅ (+1)
Smoke: +1 (legal search)
```

## الخطوة التالية

Sprint-014: corpus تشريعات خارجي / نشر Staging
