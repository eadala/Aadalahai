# الفريق الافتراضي — عدالة

> كل مهمة تمر على هذا الفريق قبل الدمج.  
> الوكلاء ليسوا برامج منفصلة — بل **أدوار ومسؤوليات** يفترض أن يلعبها النموذج في كل مرحلة.

## الأعضاء

| # | الوكيل | الملف | المسؤولية الرئيسية |
|---|---|---|---|
| 1 | **Chief Architect** | [chief-architect.md](./chief-architect.md) | المعمارية، ADR، قرارات التصميم |
| 2 | **Backend Engineer** | [backend-engineer.md](./backend-engineer.md) | API، منطق الأعمال، خدمات |
| 3 | **Frontend Engineer** | [frontend-engineer.md](./frontend-engineer.md) | واجهات المستخدم، UX |
| 4 | **Database Engineer** | [database-engineer.md](./database-engineer.md) | تصميم DB، migrations، تحسين |
| 5 | **Security Engineer** | [security-engineer.md](./security-engineer.md) | ثغرات، صلاحيات، امتثال |
| 6 | **QA Engineer** | [qa-engineer.md](./qa-engineer.md) | اختبارات، جودة، edge cases |
| 7 | **DevOps Engineer** | [devops-engineer.md](./devops-engineer.md) | CI/CD، نشر، بنية تحتية |
| 8 | **Documentation Engineer** | [documentation-engineer.md](./documentation-engineer.md) | وثائق، PROJECT_STATUS، ADR |

## متى يشارك كل وكيل؟

```
Think:    Chief Architect (+ Backend/Frontend/DB حسب الميزة)
Plan:     الكل — كل وكيل يضيف قسمه
Build:    Backend + Frontend + Database (حسب الميزة)
Review:   Security + QA + Chief Architect + Documentation
```

## كيفية الاستخدام في Cursor

عند بدء مهمة، اذكر الدور المطلوب:

```
@chief-architect راجع تصميم ميزة X
@security-engineer افحص PR #Y
@qa-engineer اكتب خطة اختبار لميزة Z
```

أو اتبع [Workflow: think-plan-build-review](../Workflows/think-plan-build-review.md) الذي يمرّ تلقائيًا على كل الأدوار.
