# Adalah AI — Engineering OS

> **عدالة** ليست مشروعًا يعتمد على prompts — بل منصة لها نظام تشغيل هندسي خاص.

## البدء السريع

1. اقرأ [.docs/Vision.md](../.docs/Vision.md) لفهم الرؤية
2. راجع [.docs/Architecture.md](../.docs/Architecture.md) للبنية
3. افتح Cursor — سيقرأ `.cursor/rules/` تلقائيًا
4. لأي ميزة جديدة: اتبع [.ai/Workflows/think-plan-build-review.md](.ai/Workflows/think-plan-build-review.md)

## هيكل المشروع

```
adalah-ai/
├── .docs/          # Knowledge Base — 100+ وثيقة مستهدفة
│   ├── Vision.md
│   ├── Roadmap.md
│   ├── Architecture.md
│   ├── ADR/
│   ├── API/
│   ├── Database/
│   ├── Security/
│   └── Performance/
├── .ai/            # العمليات والوكلاء
│   ├── Rules/
│   ├── Agents/
│   ├── Skills/
│   ├── Playbooks/
│   ├── Prompts/
│   └── Workflows/
├── .tasks/         # العمل الجاري
│   ├── Sprint-001.md
│   ├── Bugs.md
│   └── Features.md
├── .cursor/        # قواعد Cursor
│   └── rules/
└── PROJECT_STATUS.md
```

## سير العمل

```
طلب ميزة → Think → Plan → Build → Review → دمج
```

## الفريق الافتراضي

| الوكيل | الملف |
|---|---|
| Chief Architect | [.ai/Agents/chief-architect.md](.ai/Agents/chief-architect.md) |
| Backend Engineer | [.ai/Agents/backend-engineer.md](.ai/Agents/backend-engineer.md) |
| Frontend Engineer | [.ai/Agents/frontend-engineer.md](.ai/Agents/frontend-engineer.md) |
| Database Engineer | [.ai/Agents/database-engineer.md](.ai/Agents/database-engineer.md) |
| Security Engineer | [.ai/Agents/security-engineer.md](.ai/Agents/security-engineer.md) |
| QA Engineer | [.ai/Agents/qa-engineer.md](.ai/Agents/qa-engineer.md) |
| DevOps Engineer | [.ai/Agents/devops-engineer.md](.ai/Agents/devops-engineer.md) |
| Documentation Engineer | [.ai/Agents/documentation-engineer.md](.ai/Agents/documentation-engineer.md) |

## الحالة

راجع [PROJECT_STATUS.md](PROJECT_STATUS.md) للحالة الحالية.

## التشغيل المحلي

```bash
cp .env.example .env
docker compose up -d      # Postgres + Redis
npm install
npm run db:migrate
npm run dev               # API على http://localhost:3001
npm test                  # 15 اختبار
```

## الترخيص

TBD
