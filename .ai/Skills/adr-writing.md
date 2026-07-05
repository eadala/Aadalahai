# Skill: كتابة ADR

## متى تُستخدم

عند أي قرار معماري مهم — عادة في نهاية **Think** أو **Plan**.

## الخطوات

1. انسخ [.docs/ADR/000-template.md](../../.docs/ADR/000-template.md)
2. سمّه `NNN-عنوان-مختصر.md` (رقم تسلسلي)
3. املأ كل قسم
4. حدد الحالة: `مقترح` → `مقبول` بعد المراجعة
5. أضفه لجدول ADRs في `Architecture.md`

## متى أكتب ADR؟

| الحالة | ADR مطلوب؟ |
|---|---|
| اختيار قاعدة بيانات | ✅ |
| اختيار framework | ✅ |
| إضافة خدمة جديدة | ✅ |
| تغيير نمط API | ✅ |
| إضافة حقل لجدول | ❌ |
| إصلاح bug بسيط | ❌ |
| refactor داخلي | ❌ (إلا إن غيّر البنية) |

## المراجع

- [.docs/ADR/000-template.md](../../.docs/ADR/000-template.md)
- [.docs/ADR/001-engineering-os.md](../../.docs/ADR/001-engineering-os.md) — مثال
