# Sprint-016 — Legislation RAG in Chat

**الفترة**: 2026-07-05  
**الهدف**: دمج corpus التشريعات في RAG المحادثة  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `RAGService.retrieve()` يدمج user + legislation | ✅ |
| 2 | `retrieveUserOnly()` لـ search scope=user | ✅ |
| 3 | Citation موسّع (source, legislationId, articleRef) | ✅ |
| 4 | Web: CitationCard + SourceWarning | ✅ |
| 5 | Tests + smoke (+1) | ✅ |
| 6 | ADR-017 + OpenAPI | ✅ |

## الاختبارات

```
API: 75 ✅ (+2)
SDK: 11 ✅
E2E: 7 ✅
Smoke: 19 ✅ (+1)
```

## الخطوة التالية

Sprint-017: توسيع corpus التشريعات + تحسين دقة الاسترجاع
