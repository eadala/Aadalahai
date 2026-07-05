# Playbook: مراجعة أمنية

> يُنفَّذ في مرحلة **Review** لكل PR.

## قائمة الفحص

### المصادقة والتفويض
- [ ] Endpoints المحمية تتطلب auth
- [ ] RBAC: المستخدم يرى فقط ما يملك صلاحية له
- [ ] Tokens لها expiry مناسب
- [ ] لا privilege escalation ممكن

### المدخلات
- [ ] Validation على كل input
- [ ] Sanitization ضد XSS
- [ ] Parameterized queries (لا SQL injection)
- [ ] File upload: نوع وحجم محدود

### البيانات
- [ ] لا أسرار في الكود أو logs
- [ ] بيانات حساسة مشفرة
- [ ] لا تسريب بيانات في error messages
- [ ] Audit log للعمليات الحساسة

### AI-specific
- [ ] Prompt injection mitigation
- [ ] Output filtering
- [ ] لا إرسال بيانات حساسة للـ LLM دون ضوابط
- [ ] Rate limiting على endpoints AI

### Dependencies
- [ ] لا vulnerabilities معروفة (`npm audit` / `pip audit`)
- [ ] Dependencies محدثة

## المخرج

```markdown
## مراجعة أمنية: [PR/ميزة]

### النتيجة: ✅ آمن | ⚠️ ملاحظات | ❌ ثغرات

### الثغرات المكتشفة
| # | الخطورة | الوصف | الإصلاح |
|---|---|---|---|
| | | | |

### التوصيات
- ...
```

## المراجع

- [.docs/Security/](../../.docs/Security/)
- [.ai/Agents/security-engineer.md](../Agents/security-engineer.md)
