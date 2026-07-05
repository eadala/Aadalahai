# Skill: مراجعة الكود

## متى تُستخدم

مرحلة **Review** — قبل الدمج.

## قائمة المراجعة

### عام
- [ ] الكود يحقق المتطلبات؟
- [ ] لا كود ميت أو commented-out
- [ ] تسمية واضحة ومتسقة
- [ ] لا تكرار (DRY)

### Backend
- [ ] Input validation على كل endpoint
- [ ] Error handling موحد
- [ ] لا business logic في controllers
- [ ] Logging مناسب

### Frontend
- [ ] Loading + error states
- [ ] RTL يعمل
- [ ] Responsive
- [ ] لا fetch مباشر من components

### Database
- [ ] Migration موجود
- [ ] فهرسة مناسبة
- [ ] لا N+1 queries

### Security
- [ ] Auth على endpoints المحمية
- [ ] لا أسرار في الكود
- [ ] Input sanitization

### Tests
- [ ] اختبارات موجودة
- [ ] تغطية كافية
- [ ] edge cases مغطاة

## المخرج

```markdown
## مراجعة: [اسم الميزة/PR]

### النتيجة: ✅ مقبول | ⚠️ يحتاج تعديل | ❌ مرفوض

### ملاحظات
- ...

### إجراءات مطلوبة
- [ ] ...
```
