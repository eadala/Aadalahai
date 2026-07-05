# API — عدالة

> Base URL: `http://localhost:3001` | Version: `v1`

## Auth — `/api/v1/auth`

| Method | Path | Auth | الحالة |
|---|---|---|---|
| POST | `/register` | No | ✅ |
| POST | `/login` | No | ✅ |
| POST | `/refresh` | No | ✅ |
| POST | `/logout` | No | ✅ |
| GET | `/me` | Bearer | ✅ |

راجع [Auth docs](./auth.md) للتفاصيل.

## Chat — `/api/v1/chat`

| Method | Path | Auth | الحالة |
|---|---|---|---|
| POST | `/sessions` | Bearer | ✅ |
| GET | `/sessions` | Bearer | ✅ |
| GET | `/sessions/:id` | Bearer | ✅ |
| DELETE | `/sessions/:id` | Bearer | ✅ |
| POST | `/sessions/:id/messages` | Bearer | ✅ |

راجع [Chat docs](./chat.md) للتفاصيل.

## Documents — `/api/v1/documents`

| Method | Path | Auth | الحالة |
|---|---|---|---|
| POST | `/` | Bearer | ✅ |
| GET | `/` | Bearer | ✅ |
| GET | `/:id` | Bearer | ✅ |

راجع [Documents docs](./documents.md) للتفاصيل.

## Health

| Method | Path | Auth |
|---|---|---|
| GET | `/health` | No |

## تنسيق الأخطاء

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "بيانات غير صالحة",
    "details": [{ "field": "email", "issue": "invalid_format" }]
  }
}
```
