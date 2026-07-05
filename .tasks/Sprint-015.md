# Sprint-015 — Legislation Corpus + Search Scope

**الفترة**: 2026-07-05  
**الهدف**: corpus تشريعات مشترك + بحث بثلاث نطاقات  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | Migration `legislation_sources/chunks` | ✅ |
| 2 | Seed corpus (نظام العمل + إجراءات جزائية) | ✅ |
| 3 | `GET /api/v1/legislation` | ✅ |
| 4 | `search?scope=all\|user\|legislation` | ✅ |
| 5 | SDK + web scope tabs | ✅ |
| 6 | Tests + smoke (+2) + E2E | ✅ |
| 7 | ADR-016 + OpenAI staging docs | ✅ |

## Seed Content

- نظام العمل السعودي (المادة 77، 80)
- نظام الإجراءات الجزائية (المادة 112)

## الاختبارات

```
API: 73 ✅ (+2)
SDK: 11 ✅ (+1)
E2E: 7 ✅ (+1)
Smoke: 18 ✅ (+2)
```

## التحقق بعد الدمج (PR #15)

- Lint + typecheck ✅
- OpenAPI validated (`swagger-cli validate`) ✅
- إصلاح `registerTestUser` — fallback إلى login عند EMAIL_EXISTS (اختبار legislation)

## الخطوة التالية

Sprint-016: توسيع corpus + RAG من التشريعات في Chat
