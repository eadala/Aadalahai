# ADR-004: تكامل LLM — واجهة قابلة للتبديل

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect  
**يحل محل**: —

## السياق

Sprint-003 يحتاج تكامل LLM للمحادثة مع RAG. Architecture.md يتطلب Pluggable AI.

## الخيارات

### الخيار 1: OpenAI SDK مباشرة
- **المزايا**: بسيط، streaming جاهز
- **التنازلات**: مرتبط بمزود واحد

### الخيار 2: واجهة + Providers (المختار)
- **المزايا**: قابل للتبديل، mock للاختبارات، يدعم OpenAI وغيره لاحقًا
- **التنازلات**: طبقة abstraction إضافية

## القرار

```typescript
interface LLMProvider {
  stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string>;
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
}
```

| Provider | الاستخدام |
|---|---|
| `mock` | اختبارات + تطوير بدون API key |
| `openai` | إنتاج (يتطلب OPENAI_API_KEY) |

**Streaming**: Server-Sent Events (SSE) عبر `text/event-stream`

## العواقب

- `LLM_PROVIDER` في environment
- Mock provider يُستخدم تلقائيًا في `NODE_ENV=test`
- System prompt قانوني عربي مدمج في Chat service

## المراجع

- [.docs/Architecture.md](../Architecture.md)
