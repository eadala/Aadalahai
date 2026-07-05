# API — توثيق واجهات البرمجة

> كل endpoint موثق هنا قبل التنفيذ. راجع [Playbook: ميزة جديدة](../../.ai/Playbooks/new-feature.md).

## المعايير

- **REST** كأساس، GraphQL لاحقًا إن لزم
- **OpenAPI 3.1** لكل خدمة
- **Versioning**: `/api/v1/...`
- **Auth**: Bearer JWT في header `Authorization`
- **Errors**: تنسيق موحد (انظر أدناه)

## تنسيق الأخطاء

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "وصف مقروء",
    "details": [{ "field": "email", "issue": "invalid_format" }]
  }
}
```

## الخدمات المخططة

| الخدمة | Base Path | الحالة | الوثيقة |
|---|---|---|---|
| Auth | `/api/v1/auth` | ⬜ مخطط | — |
| Users | `/api/v1/users` | ⬜ مخطط | — |
| Chat | `/api/v1/chat` | ⬜ مخطط | — |
| Documents | `/api/v1/documents` | ⬜ مخطط | — |

## كيفية إضافة endpoint

1. صمم في مرحلة **Think** (مقارنة حلول)
2. وثّق هنا في مرحلة **Plan**
3. نفّذ في **Build** وفق `.cursor/rules/backend.mdc`
4. راجع في **Review** (Security + QA)
