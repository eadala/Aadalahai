# Playbook: ميزة جديدة

> الإجراء المعياري لإضافة أي ميزة في عدالة.

## المتطلبات المسبقة

- الميزة مُسجَّلة في [.tasks/Features.md](../../.tasks/Features.md)
- السبرنت الحالي محدد

## الخطوات

### 1. Think (التفكير)

```
المدخلات: وصف الميزة
الأدوار: Chief Architect + Backend/Frontend/DB (حسب النوع)
المهارات: requirements-analysis → design-comparison
المخرجات: تحليل متطلبات + مقارنة تصاميم + قرار
```

- [ ] تحليل المتطلبات ([Skill](../Skills/requirements-analysis.md))
- [ ] مقارنة 2-3 تصاميم ([Skill](../Skills/design-comparison.md))
- [ ] اختيار التصميم مع تبرير
- [ ] ADR إن كان قرارًا معماريًا ([Skill](../Skills/adr-writing.md))

### 2. Plan (التخطيط)

```
الأدوار: الكل (كل وكيل يضيف قسمه)
المخرجات: وثيقة تصميم + خطة تنفيذ + مهام + اختبارات
```

- [ ] وثيقة تصميم (Design Doc)
- [ ] خطة تنفيذ (مهام مقسمة)
- [ ] خطة اختبار ([Skill](../Skills/test-planning.md))
- [ ] تحديث API docs / Database docs
- [ ] تحديث PROJECT_STATUS.md

### 3. Build (التنفيذ)

```
الأدوار: Backend + Frontend + Database
القواعد: .cursor/rules/*
```

- [ ] تنفيذ الكود وفق القواعد
- [ ] كتابة الاختبارات
- [ ] commit + push

### 4. Review (المراجعة)

```
الأدوار: Security + QA + Chief Architect + Documentation
إلزامي: لا دمج بدون اكتمال هذه المرحلة
```

- [ ] مراجعة أمنية ([Playbook](./security-review.md))
- [ ] تشغيل الاختبارات + تقرير تغطية
- [ ] مراجعة كود ([Skill](../Skills/code-review.md))
- [ ] مراجعة معمارية (Chief Architect)
- [ ] تحديث الوثائق (Documentation Engineer)
- [ ] تحديث PROJECT_STATUS.md

### 5. Merge

- [ ] PR approved من كل الأدوار
- [ ] CI أخضر
- [ ] دمج

## Definition of Done

ميزة "مكتملة" عندما:

- [x] تحليل + تصميم موثق
- [x] كود + اختبارات
- [x] مراجعة أمنية ✅
- [x] وثائق محدثة
- [x] PROJECT_STATUS محدث
