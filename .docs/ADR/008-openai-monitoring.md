# ADR-008: OpenAI Production Hardening & Monitoring

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-007

## السياق

بعد Sprint-003، مزودو OpenAI موجودون لكن الافتراضي `mock`. Sprint-007 يجهّز الإنتاج:
- معالجة أخطاء OpenAI
- readiness و metrics
- مراقبة استدعاءات AI

## القرار

### 1. OpenAI Client مشترك
- `openai-client.ts`: timeout, retry على 429/5xx, parse errors
- `OpenAIError` → `AppError` في error handler

### 2. Env vars جديدة
| المتغير | الافتراضي |
|---|---|
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` |
| `OPENAI_TIMEOUT_MS` | `30000` |
| `OPENAI_MAX_RETRIES` | `2` |
| `METRICS_ENABLED` | `true` |

### 3. Monitoring endpoints
| Endpoint | الغرض |
|---|---|
| `GET /health` | Liveness — سريع، بدون dependencies |
| `GET /ready` | Readiness — DB + AI provider config |
| `GET /metrics` | Prometheus text format |

### 4. AI Instrumentation
- Wrappers على LLM و Embedder: latency + error counters
- RAG retrieve: duration histogram

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| OpenAI SDK الرسمي | `fetch` كافٍ، أقل dependencies |
| prom-client | histogram بسيط كافٍ للمرحلة 1 |
| OpenAI ping في /ready | مكلف وبطيء — نتحقق من config فقط |

## التفعيل في الإنتاج

```bash
LLM_PROVIDER=openai
EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=sk-...
EMBEDDING_DIMENSIONS=384
```

**تحذير**: تغيير embedder يتطلب إعادة رفع/فهرسة الوثائق.

## العواقب

- اختبارات CI تبقى على mock
- اختبارات unit لـ OpenAI providers مع mocked fetch
- SDK يضيف `client.system.ready()` و `client.system.metrics()`
