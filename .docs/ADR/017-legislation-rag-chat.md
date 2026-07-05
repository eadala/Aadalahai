# ADR-017: Legislation RAG in Chat

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect  
**يحل محل**: —

## السياق

Sprint-015 أضاف corpus تشريعات مشترك (`legislation_sources/chunks`) وبحثًا منفصلًا.  
المحادثة (Sprint-003) كانت تسترجع وثائق المستخدم فقط عبر `RAGService.retrieve()`.

## القرار

توسيع `RAGService.retrieve()` لدمج:

1. **وثائق المستخدم** — vector search على `document_chunks`
2. **corpus التشريعات** — vector search على `legislation_chunks`

ثم دمج النتائج حسب `similarity` وأخذ أعلى `RAG_TOP_K` (5).

### واجهة الاستشهاد

```typescript
Citation {
  source: "user" | "legislation"
  documentId: string | null
  legislationId: string | null
  articleRef: string | null
}
```

### فصل البحث عن المحادثة

`SearchService` يستخدم `retrieveUserOnly()` عند `scope=user` حتى لا تتلوث نتائج البحث المقيّدة.

## العواقب

- المحادثة تعمل بدون رفع وثائق (تعتمد على التشريعات المدمجة)
- Smoke: `chat legislation rag` يتحقق من استشهاد `source=legislation`
- Prompt محدّث: «مصادر» بدل «وثائق مرفوعة» فقط

## المراجع

- [ADR-005](./005-rag-architecture.md)
- [ADR-016](./016-legislation-corpus.md)
