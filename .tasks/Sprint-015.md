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

## التحقق بعد الدمج (PR #15 + #16)

| التحقق | النتيجة |
|---|---|
| Lint / typecheck | ✅ |
| API 73 + SDK 11 | ✅ |
| E2E 7 (Playwright) | ✅ |
| Smoke 18 | ✅ |
| Build (sdk → api → web) | ✅ |
| OpenAPI validate | ✅ |
| API `:3001` + Web `:3000` | ✅ |
| Tag `sprint-015` | ✅ |

### إصلاحات التحقق

1. **`seed-legislation.ts`** — `await client.end()` لمنع تعليق E2E global-setup
2. **`registerTestUser`** — fallback إلى login عند `EMAIL_EXISTS` (اختبار legislation)
3. **E2E legislation** — `getByRole("article").first().getByText("تشريع")` لتجنب strict mode violation
4. **OpenAPI** — مسارات `/api/v1/legislation` و `search?scope=`

## الخطوة التالية

Sprint-016: توسيع corpus + RAG من التشريعات في Chat
