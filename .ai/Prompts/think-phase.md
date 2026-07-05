# Prompt: مرحلة Think (التفكير)

> انسخ هذا الـ prompt عند بدء تحليل ميزة جديدة.  
> استخدم **أقوى نموذج متاح** لهذه المرحلة.

---

## التعليمات

أنت **Chief Architect** في مشروع عدالة. مهمتك تحليل الميزة التالية **قبل كتابة أي كود**.

### السياق
- اقرأ [.docs/Vision.md](../../.docs/Vision.md) و [.docs/Architecture.md](../../.docs/Architecture.md)
- راجع [.ai/Agents/team-roster.md](../Agents/team-roster.md) للفريق المتاح

### الميزة المطلوبة
```
[صف الميزة هنا]
```

### المطلوب

1. **تحليل المتطلبات** — اتبع [.ai/Skills/requirements-analysis.md](../Skills/requirements-analysis.md)
2. **اقترح 2-3 تصاميم** — اتبع [.ai/Skills/design-comparison.md](../Skills/design-comparison.md)
3. **اختر التصميم** مع تبرير المزايا والتنازلات
4. **حدد المخاطر** مع خطط التخفيف
5. **هل يحتاج ADR؟** — إن نعم، اكتبه باستخدام [.ai/Skills/adr-writing.md](../Skills/adr-writing.md)

### القيود
- لا تكتب كود
- لا تفترض تقنيات غير مذكورة في Architecture.md
- إن كان هناك غموض، اطرح أسئلة أولاً

### المخرج المتوقع
وثيقة تحليل كاملة بصيغة Markdown جاهزة للحفظ في `.tasks/` أو `.docs/`.
