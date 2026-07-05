# Sprint-003 — Chat + RAG MVP

**الفترة**: 2026-07-13 → 2026-07-26  
**الهدف**: جلسات محادثة + RAG pipeline أساسي

## المهام المخططة

| # | المهمة | الحالة | المسؤول |
|---|---|---|---|
| 1 | Chat session + message models | ⬜ | Database Engineer |
| 2 | Chat API (create session, send message, history) | ⬜ | Backend Engineer |
| 3 | RAG: document chunking + embedding | ⬜ | Backend Engineer |
| 4 | pgvector extension + vector search | ⬜ | Database Engineer |
| 5 | LLM integration (pluggable interface) | ⬜ | Backend Engineer |
| 6 | Streaming response (SSE) | ⬜ | Backend Engineer |
| 7 | Chat + RAG tests | ⬜ | QA Engineer |
| 8 | API docs update | ⬜ | Documentation Engineer |

## المتطلبات المسبقة

- [x] Sprint-002 مكتمل (Auth)
- [ ] ADR-004: اختيار LLM provider
- [ ] ADR-005: RAG architecture

## ملاحظات

- يبدأ بمرحلة Think لمقارنة LLM providers
- pgvector في نفس Postgres (لا Qdrant منفصل في MVP)
