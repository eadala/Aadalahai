# ADR-007: API SDK + نشر الإنتاج

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect + DevOps Engineer

## السياق

Sprint-006 يبدأ المرحلة 2. نحتاج:
- SDK للمطورين الخارجيين
- نشر إنتاجي containerized

## القرار

### API SDK — `@adalah/sdk`
- TypeScript package في `packages/sdk`
- يغطي كل endpoints
- يدعم SSE streaming
- Token storage عبر callbacks (لا localStorage مدمج)

### النشر
- Docker multi-stage لـ API و Web
- `docker-compose.prod.yml` للإنتاج
- Next.js `output: 'standalone'`
- Migration تلقائي عند بدء API container
- OpenAPI 3.1 spec في `.docs/API/openapi.yaml`

### CI
- job `build` يبني API + Web + SDK
- job `test` موجود

## العواقب

- `packages/*` يُضاف لـ npm workspaces
- Web يستخدم SDK داخليًا (dogfooding)
- Redis جاهز في compose لكن غير مستخدم بعد

## المراجع

- [.docs/API/openapi.yaml](./API/openapi.yaml)
