# Security — الأمان

## نموذج التهديدات (مبدئي)

| التهديد | الخطورة | الضابط |
|---|---|---|
| تسريب بيانات محادثات قانونية | حرج | تشفير at-rest + in-transit، RBAC |
| حقن prompts | عالي | input sanitization، system prompts محمية |
| وصول غير مصرح لـ API | عالي | JWT + rate limiting + audit logs |
| تسريب وثائق بين مستخدمين | حرج | tenant isolation، row-level security |
| هجمات على Vector DB | متوسط | عزل الفهارس per-user/org |

## الضوابط الإلزامية

### المصادقة والتفويض
- JWT مع expiry قصير + refresh tokens
- RBAC: `user`, `lawyer`, `admin`
- MFA للحسابات الحساسة (مرحلة لاحقة)

### البيانات
- TLS 1.3 لكل الاتصالات
- تشفير at-rest (AES-256) للبيانات الحساسة
- لا تخزين كلمات مرور بنص صريح (bcrypt/argon2)

### التطبيق
- Input validation على كل endpoint
- CORS مقيد بالنطاقات المعتمدة
- Rate limiting: 100 req/min (user), 1000 req/min (API key)
- Audit log لكل عملية حساسة

### الذكاء الاصطناعي
- لا إرسال بيانات حساسة للـ LLM دون موافقة
- System prompts لا تُكشف للمستخدم
- Output filtering لمنع تسريب بيانات داخلية

## مراجعة أمنية

كل PR يمر على **Security Engineer** (راجع `.ai/Agents/security-engineer.md`).  
استخدم [Playbook: مراجعة أمنية](../../.ai/Playbooks/security-review.md).

## الامتثال (مستقبلي)

- GDPR — حق الحذف، تصدير البيانات
- أنظمة حماية البيانات المحلية
