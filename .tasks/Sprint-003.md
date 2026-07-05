# Sprint-003 — Chat + RAG MVP ✅

**الفترة**: 2026-07-05  
**الهدف**: جلسات محادثة + RAG pipeline أساسي

## المهام

| # | المهمة | الحالة | المسؤول |
|---|---|---|---|
| 1 | Chat session + message models | ✅ | Database Engineer |
| 2 | Chat API (5 endpoints) | ✅ | Backend Engineer |
| 3 | RAG: chunking + embedding | ✅ | Backend Engineer |
| 4 | pgvector + vector search | ✅ | Database Engineer |
| 5 | LLM pluggable (mock + openai) | ✅ | Backend Engineer |
| 6 | Streaming SSE | ✅ | Backend Engineer |
| 7 | Tests (15 جديد = 30 إجمالي) | ✅ | QA Engineer |
| 8 | API docs + ADRs | ✅ | Documentation Engineer |

## القرارات

- [ADR-004](../.docs/ADR/004-llm-integration.md): LLM pluggable + SSE
- [ADR-005](../.docs/ADR/005-rag-architecture.md): pgvector RAG

## المراجعة

- [x] Think → Plan → Build → Review
- [x] 30 tests passing
- [x] Security: auth على كل endpoints
- [x] Documentation updated

## الخطوة التالية

Sprint-004: Chat UI (Next.js) + Arabic RTL
