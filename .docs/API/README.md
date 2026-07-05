# API — Auth Service

> Base URL: `http://localhost:3001`  
> Version: `v1`  
> ADR: [003-auth-strategy](../ADR/003-auth-strategy.md)

## Auth Endpoints

### POST `/api/v1/auth/register`

تسجيل مستخدم جديد.

**Request:**
```json
{
  "email": "lawyer@example.com",
  "password": "SecurePass1",
  "name": "محامي تجريبي"
}
```

**Password rules:** 8+ chars, uppercase, lowercase, digit.

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "lawyer@example.com",
    "name": "محامي تجريبي",
    "role": "user",
    "createdAt": "2026-07-05T08:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "base64url...",
    "expiresIn": "15m"
  }
}
```

**Errors:** `400` VALIDATION_ERROR, `409` EMAIL_EXISTS

---

### POST `/api/v1/auth/login`

تسجيل الدخول.

**Request:**
```json
{
  "email": "lawyer@example.com",
  "password": "SecurePass1"
}
```

**Response (200):** نفس هيكل register.

**Errors:** `401` INVALID_CREDENTIALS

---

### POST `/api/v1/auth/refresh`

تجديد access token مع rotation للـ refresh token.

**Request:**
```json
{
  "refreshToken": "base64url..."
}
```

**Response (200):** نفس هيكل register (refresh token جديد).

**Errors:** `401` INVALID_REFRESH_TOKEN

---

### POST `/api/v1/auth/logout`

إلغاء refresh token.

**Request:**
```json
{
  "refreshToken": "base64url..."
}
```

**Response (200):**
```json
{ "message": "تم تسجيل الخروج" }
```

---

### GET `/api/v1/auth/me`

المستخدم الحالي. يتطلب `Authorization: Bearer <accessToken>`.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "lawyer@example.com",
    "name": "محامي تجريبي",
    "role": "user",
    "createdAt": "2026-07-05T08:00:00.000Z"
  }
}
```

**Errors:** `401` UNAUTHORIZED

---

### GET `/health`

فحص صحة الخادم.

**Response (200):**
```json
{
  "status": "ok",
  "service": "adalah-api",
  "timestamp": "2026-07-05T08:00:00.000Z"
}
```

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

## الخدمات

| الخدمة | Base Path | الحالة |
|---|---|---|
| Auth | `/api/v1/auth` | ✅ Sprint-002 |
| Users | `/api/v1/users` | ⬜ مخطط |
| Chat | `/api/v1/chat` | ⬜ مخطط |
| Documents | `/api/v1/documents` | ⬜ مخطط |
