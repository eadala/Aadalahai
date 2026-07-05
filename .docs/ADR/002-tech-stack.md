# ADR-002: اختيار المكدس التقني للـ API

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect  
**يحل محل**: —

## السياق

Sprint-002 يحتاج أول كود تشغيلي. لا يوجد كود بعد. نحتاج مكدسًا يدعم:
- API REST سريع
- PostgreSQL + migrations
- Redis
- اختبارات
- تكامل لاحق مع Next.js و RAG (Python services لاحقًا)

## الخيارات المدروسة

### الخيار 1: Python FastAPI
- **المزايا**: ممتاز للـ AI/RAG، ecosystem غني
- **التنازلات**: فصل عن Next.js frontend، نوعان من اللغات

### الخيار 2: Node.js + TypeScript + Fastify (المختار)
- **المزايا**: نوع واحد مع Next.js، أداء عالي، Drizzle ORM type-safe
- **التنازلات**: RAG قد يحتاج خدمة Python منفصلة لاحقًا (متوافق مع Architecture)

### الخيار 3: Go
- **المزايا**: أداء، concurrency
- **التنازلات**: منحنى تعلم، أقل ملاءمة لـ Next.js monorepo

## القرار

**Node.js 22 + TypeScript + Fastify + Drizzle ORM**

| المكون | الاختيار |
|---|---|
| Runtime | Node.js 22 LTS |
| Framework | Fastify 5 |
| ORM | Drizzle |
| Validation | Zod |
| Password | argon2 |
| JWT | @fastify/jwt |
| Tests | Vitest |
| Monorepo | npm workspaces |

## العواقب

- هيكل `apps/api/` للخدمة الأولى (User/Auth)
- `apps/web/` لاحقًا (Sprint-004)
- خدمة AI/RAG قد تكون Python منفصلة — لا تعارض

## المراجع

- [.docs/Architecture.md](../Architecture.md)
