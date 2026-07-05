# Prompt: مرحلة Review (المراجعة)

> يُستخدم قبل الدمج. **إلزامي** — لا تخطَّ هذه المرحلة.

---

## التعليمات

راجع العمل المكتمل قبل الدمج. كل دور يراجع من منظوره.

### التغييرات
```
[الصق diff أو وصف التغييرات هنا]
```

### المراجعات المطلوبة

#### 1. Security Engineer
اتبع [.ai/Playbooks/security-review.md](../Playbooks/security-review.md)
- [ ] قائمة فحص أمنية كاملة
- [ ] تقرير: آمن / ملاحظات / ثغرات

#### 2. QA Engineer
- [ ] تشغيل كل الاختبارات
- [ ] تقرير تغطية
- [ ] edge cases مُختبرة

#### 3. Chief Architect
اتبع [.ai/Skills/code-review.md](../Skills/code-review.md)
- [ ] اتساق مع Architecture.md
- [ ] لا over-engineering
- [ ] البنية نظيفة

#### 4. Documentation Engineer
- [ ] `.docs/API/` محدث
- [ ] `.docs/Database/` محدث (إن لزم)
- [ ] `PROJECT_STATUS.md` محدث
- [ ] ADR موجود (إن لزم)

#### 5. Performance (إن لزم)
- [ ] ضمن SLOs في `.docs/Performance/`

### المخرج

```markdown
## تقرير المراجعة: [الميزة]

### Security: ✅ | ⚠️ | ❌
### QA: ✅ | ⚠️ | ❌
### Architecture: ✅ | ⚠️ | ❌
### Documentation: ✅ | ⚠️ | ❌

### القرار: ✅ جاهز للدمج | ❌ يحتاج تعديل

### إجراءات مطلوبة (إن وجدت)
- [ ] ...
```
