# Performance — الأداء

## أهداف الأداء (SLOs)

| المقياس | الهدف | القياس |
|---|---|---|
| استجابة Chat (first token) | < 2s | p95 |
| استجابة Chat (كاملة) | < 10s | p95 |
| API endpoints (غير AI) | < 200ms | p95 |
| RAG retrieval | < 500ms | p95 |
| Document upload + index | < 30s لملف 10MB | p95 |
| Uptime | 99.9% | شهري |

## استراتيجيات

### Chat / AI
- Streaming responses (SSE)
- Cache للأسئلة المتكررة (Redis)
- Model routing: نموذج أصغر للأسئلة البسيطة

### RAG
- Pre-computed embeddings
- Hybrid search (vector + keyword)
- Chunk size optimization (512-1024 tokens)

### Database
- Connection pooling (PgBouncer)
- Read replicas للاستعلامات الثقيلة
- Partial indexes حيث يلزم

### Frontend
- Code splitting
- Lazy loading للمكونات الثقيلة
- CDN للأصول الثابتة

## المراقبة

- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Alerts**: عند تجاوز SLOs

## كيفية التحقق

كل ميزة جديدة تُقيَّم في مرحلة **Review** ضد هذه الأهداف.  
إن تجاوزت حدًا → أنشئ ADR يوثق القرار أو التحسين المطلوب.
