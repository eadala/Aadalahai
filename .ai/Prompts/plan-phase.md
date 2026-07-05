# Prompt: مرحلة Plan (التخطيط)

> يُستخدم بعد اكتمال Think واختيار التصميم.

---

## التعليمات

بناءً على نتيجة مرحلة Think، أنشئ خطة تنفيذ كاملة.

### نتيجة Think
```
[الصق نتيجة Think هنا]
```

### المطلوب من كل دور

#### Chief Architect
- [ ] مراجعة القرار والتأكد من توافقه مع Architecture.md
- [ ] ADR إن لم يُكتب بعد

#### Backend Engineer
- [ ] تصميم API endpoints (method, path, request/response)
- [ ] تحديث `.docs/API/`

#### Frontend Engineer
- [ ] Component tree
- [ ] User flows

#### Database Engineer
- [ ] مخطط ER للجداول الجديدة/المعدلة
- [ ] خطة migrations
- [ ] تحديث `.docs/Database/`

#### QA Engineer
- [ ] خطة اختبار — [.ai/Skills/test-planning.md](../Skills/test-planning.md)

#### Security Engineer
- [ ] متطلبات أمنية للميزة
- [ ] تهديدات محتملة

#### DevOps Engineer
- [ ] متطلبات بنية تحتية (إن وجدت)

#### Documentation Engineer
- [ ] قائمة الوثائق التي تحتاج تحديث
- [ ] تحديث PROJECT_STATUS.md

### المخرج المتوقع

1. **Design Doc** — وثيقة تصميم شاملة
2. **قائمة مهام** — مهام مقسمة قابلة للتنفيذ
3. **خطة اختبار**
4. **تحديثات وثائق** — API, Database, Security حسب الحاجة
