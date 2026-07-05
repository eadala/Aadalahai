# Adalah AI — نظام التشغيل

> هذا المجلد هو **العقل التشغيلي** لعدالة.  
> Cursor محرك تنفيذ — هذا المجلد هو من يوجّهه.

## الهيكل

| المجلد | الغرض | الملفات |
|---|---|---|
| [Rules/](./Rules/) | قواعد عامة للنماذج | global, arabic-content |
| [Agents/](./Agents/) | الفريق الافتراضي (8 أدوار) | [team-roster.md](./Agents/team-roster.md) |
| [Skills/](./Skills/) | مهارات قابلة لإعادة الاستخدام | 5 skills |
| [Playbooks/](./Playbooks/) | إجراءات متكررة | 4 playbooks |
| [Prompts/](./Prompts/) | قوالب لكل مرحلة | Think, Plan, Build, Review |
| [Workflows/](./Workflows/) | سير العمل الموحد | feature-lifecycle, think-plan-build-review |

## البدء السريع

### ميزة جديدة
1. سجّل في `.tasks/Features.md`
2. انسخ [.ai/Prompts/think-phase.md](./Prompts/think-phase.md)
3. اتبع [Workflow](./Workflows/think-plan-build-review.md)

### إصلاح خطأ
1. سجّل في `.tasks/Bugs.md`
2. اتبع [Playbook: bug-fix](./Playbooks/bug-fix.md)

### مراجعة أمنية
اتبع [Playbook: security-review](./Playbooks/security-review.md)

## القابلية للنقل

هذا النظام **لا يعتمد على Cursor**. يعمل مع:
- Cursor (عبر `.cursor/rules/`)
- Claude Code
- GPT / Codex
- أي أداة AI تقرأ ملفات المشروع

المعرفة في المشروع — لا في المحادثة.
