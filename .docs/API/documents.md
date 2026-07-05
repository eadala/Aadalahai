# Documents API

> ADR: [005-rag-architecture](../ADR/005-rag-architecture.md)

## POST `/api/v1/documents`

رفع وثيقة قانونية نصية وفهرستها للـ RAG.

```json
{
  "title": "نظام العمل السعودي",
  "content": "المادة 77: للعامل الحق في..."
}
```

**Response (201):**
```json
{
  "document": {
    "id": "uuid",
    "title": "نظام العمل السعودي",
    "status": "ready",
    "contentPreview": "المادة 77...",
    "chunkCount": 3,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Pipeline:** رفع → chunking (500 حرف) → embedding → تخزين في pgvector

## GET `/api/v1/documents`

قائمة وثائق المستخدم.

## GET `/api/v1/documents/:id`

تفاصيل وثيقة (بدون المحتوى الكامل — preview فقط).

## الحالات

| Status | المعنى |
|---|---|
| `processing` | جاري الفهرسة |
| `ready` | جاهزة للـ RAG |
| `failed` | فشلت الفهرسة |
