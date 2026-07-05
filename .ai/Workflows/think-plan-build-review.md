# Workflow: Think → Plan → Build → Review

> السير الموحد لكل عمل في عدالة.

## المخطط

```
                    ┌─────────────┐
                    │ طلب ميزة    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
              ┌─────│    THINK    │─────┐
              │     │  (تحليل)    │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │    PLAN     │     │
              │     │  (تخطيط)    │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │    BUILD    │     │
              │     │  (تنفيذ)    │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │   REVIEW    │     │
              │     │  (مراجعة)   │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │    MERGE    │     │
              │     └─────────────┘     │
              │                         │
              │  أسئلة؟ ────────────────┘
              │  (ارجع لـ Think)
              └─────────────────────────
```

## المراحل

### 1. Think — التفكير

| البند | التفاصيل |
|---|---|
| **Prompt** | [.ai/Prompts/think-phase.md](../Prompts/think-phase.md) |
| **النموذج** | الأقوى المتاح |
| **الأدوار** | Chief Architect (+ متخصصون حسب الميزة) |
| **المهارات** | requirements-analysis, design-comparison, adr-writing |
| **المخرج** | تحليل + مقارنة تصاميم + قرار + مخاطر |
| **لا** | كود، تنفيذ، افتراضات |

### 2. Plan — التخطيط

| البند | التفاصيل |
|---|---|
| **Prompt** | [.ai/Prompts/plan-phase.md](../Prompts/plan-phase.md) |
| **الأدوار** | الفريق كامل (8 وكلاء) |
| **المخرج** | Design Doc + مهام + اختبارات + تحديث وثائق |
| **يُحدَّث** | PROJECT_STATUS.md, API docs, Database docs |

### 3. Build — التنفيذ

| البند | التفاصيل |
|---|---|
| **Prompt** | [.ai/Prompts/build-phase.md](../Prompts/build-phase.md) |
| **الأدوار** | Backend + Frontend + Database |
| **القواعد** | `.cursor/rules/*` |
| **المخرج** | كود + اختبارات |
| **لا** | اجتهادات جديدة، تغييرات خارج النطاق |

### 4. Review — المراجعة

| البند | التفاصيل |
|---|---|
| **Prompt** | [.ai/Prompts/review-phase.md](../Prompts/review-phase.md) |
| **الأدوار** | Security + QA + Architect + Documentation |
| **إلزامي** | نعم — لا دمج بدونه |
| **المخرج** | تقرير مراجعة + وثائق محدثة |

## Definition of Done

```
✅ Think مكتمل (تحليل + قرار)
✅ Plan مكتمل (design doc + مهام + اختبارات)
✅ Build مكتمل (كود + اختبارات خضراء)
✅ Review مكتمل (أمان + جودة + وثائق)
✅ MERGE
```

## استثناءات

| الحالة | السير |
|---|---|
| Bug fix بسيط | Think مختصر → Build → Review مختصر |
| تغيير وثائق فقط | Plan → Build → Review |
| قرار معماري | Think → ADR → Plan |

## المراجع

- [Playbook: ميزة جديدة](../Playbooks/new-feature.md)
- [Playbook: bug fix](../Playbooks/bug-fix.md)
- [ADR-001](../../.docs/ADR/001-engineering-os.md)
