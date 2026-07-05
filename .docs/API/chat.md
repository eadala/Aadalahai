# Chat API

> ADR: [004-llm-integration](../ADR/004-llm-integration.md) | [005-rag-architecture](../ADR/005-rag-architecture.md)

## POST `/api/v1/chat/sessions`

إنشاء جلسة محادثة جديدة.

```json
{ "title": "استشارة قانونية" }
```

**Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "title": "استشارة قانونية",
    "createdAt": "...",
    "updatedAt": "...",
    "messages": []
  }
}
```

## GET `/api/v1/chat/sessions`

قائمة جلسات المستخدم.

## GET `/api/v1/chat/sessions/:id`

جلسة مع كامل الرسائل.

## DELETE `/api/v1/chat/sessions/:id`

حذف جلسة ورسائلها.

## POST `/api/v1/chat/sessions/:id/messages`

إرسال رسالة والحصول على إجابة (مع RAG).

```json
{
  "content": "ما هي حقوق العامل؟",
  "stream": false
}
```

**Response (200) — non-streaming:**
```json
{
  "userMessage": { "id": "...", "role": "user", "content": "...", "citations": [] },
  "assistantMessage": {
    "id": "...",
    "role": "assistant",
    "content": "...",
    "citations": [
      {
        "documentId": "...",
        "documentTitle": "نظام العمل",
        "chunkContent": "...",
        "similarity": 0.85
      }
    ]
  }
}
```

### Streaming (SSE)

```json
{ "content": "ما هي المادة 77؟", "stream": true }
```

**Response:** `Content-Type: text/event-stream`

```
data: {"type":"user_message","data":{...}}
data: {"type":"chunk","data":{"content":"إجابة "}}
data: {"type":"done","data":{"message":{...},"citations":[...]}}
data: [DONE]
```

## RAG Integration

عند إرسال رسالة:
1. يُستخرج embedding للسؤال
2. يُبحث في `document_chunks` (pgvector)
3. يُضاف السياق للـ LLM
4. تُرجع الإجابة مع citations
