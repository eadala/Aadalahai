# Sprint-007 — OpenAI Integration + Monitoring

**الفترة**: 2026-07-05  
**الهدف**: تفعيل OpenAI للإنتاج + مراقبة  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | OpenAI client مشترك (timeout, retry, errors) | ✅ |
| 2 | Env vars جديدة (embedding model, timeout, metrics) | ✅ |
| 3 | `/ready` readiness endpoint | ✅ |
| 4 | `/metrics` Prometheus endpoint | ✅ |
| 5 | AI instrumentation (LLM, embedder, RAG) | ✅ |
| 6 | اختبارات factory + OpenAI providers + system | ✅ |
| 7 | ADR-008 + docs + SDK update | ✅ |

## تفعيل OpenAI

```bash
LLM_PROVIDER=openai
EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=384
```

## Monitoring

```bash
curl http://localhost:3001/health   # liveness
curl http://localhost:3001/ready    # readiness
curl http://localhost:3001/metrics  # Prometheus
```

## الخطوة التالية

Sprint-008: Staging deploy + OpenAI smoke tests
