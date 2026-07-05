# Workflow: دورة حياة الميزة

> من الفكرة إلى الإنتاج — المسار الكامل.

```
طلب ميزة
    ↓
تسجيل في Features.md
    ↓
تعيين لسبرنت
    ↓
Think → Plan → Build → Review
    ↓
Merge to main
    ↓
Deploy (staging → prod)
    ↓
تحديث Roadmap + PROJECT_STATUS
    ↓
✅ مكتمل
```

## التفاصيل

### 1. طلب ميزة
- المستخدم أو الفريق يقترح ميزة
- يُسجَّل في [.tasks/Features.md](../../.tasks/Features.md)

### 2. تعيين لسبرنت
- Product/Architect يحدد الأولوية
- يُضاف لملف السبرنت المناسب

### 3. Think → Plan → Build → Review
- اتبع [think-plan-build-review.md](./think-plan-build-review.md)

### 4. Merge
- PR approved
- CI أخضر
- دمج لـ main

### 5. Deploy
- اتبع [Playbook: deployment](../Playbooks/deployment.md)
- staging أولاً → prod

### 6. إغلاق
- تحديث [Roadmap.md](../../.docs/Roadmap.md)
- تحديث [PROJECT_STATUS.md](../../PROJECT_STATUS.md)
- الميزة = ✅ في Features.md

## الوقت المتوقع لكل مرحلة

| المرحلة | النسبة التقريبية |
|---|---|
| Think | 15% |
| Plan | 20% |
| Build | 45% |
| Review | 20% |

> هذه نسب إرشادية — الميزات الكبيرة قد تحتاج عدة سبرنتات.
