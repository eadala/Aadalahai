# ADR-005: بنية RAG

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect + Database Engineer  
**يحل محل**: —

## السياق

Sprint-003 يبني RAG MVP لاسترجاع المقاطع القانونية ذات الصلة قبل الإجابة.

## الخيارات

### الخيار 1: Qdrant منفصل
- **المزايا**: متخصص في vectors
- **التنازلات**: بنية تحتية إضافية

### الخيار 2: pgvector في PostgreSQL (المختار)
- **المزايا**: قاعدة واحدة، أبسط للـ MVP، يتوافق مع Architecture
- **التنازلات**: أقل تخصصًا عند حجم ضخم (قابل للترحيل لاحقًا)

## القرار

**pgvector** في نفس PostgreSQL:

```
documents → document_chunks (embedding vector)
```

| العنصر | القيمة |
|---|---|
| Embedding dimensions | 384 (mock) / 1536 (OpenAI) |
| Chunk size | 500 حرف |
| Chunk overlap | 50 حرف |
| Top-K retrieval | 5 مقاطع |
| Distance | cosine (`<=>`) |

## Pipeline

```
رفع وثيقة → chunking → embedding → تخزين
سؤال مستخدم → embed السؤال → vector search → سياق → LLM → إجابة
```

## العواقب

- `CREATE EXTENSION vector` في migration
- Docker image: `pgvector/pgvector:pg16`
- Citations تُرجع مع كل إجابة

## المراجع

- [.docs/Database/](../Database/)
- [.docs/Performance/](../Performance/)
