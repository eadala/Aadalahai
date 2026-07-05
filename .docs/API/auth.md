# Auth API

> ADR: [003-auth-strategy](../ADR/003-auth-strategy.md)

## POST `/api/v1/auth/register`

```json
{ "email": "lawyer@example.com", "password": "SecurePass1", "name": "محامي" }
```

**Response (201):** `{ user, tokens: { accessToken, refreshToken, expiresIn } }`

## POST `/api/v1/auth/login`

```json
{ "email": "lawyer@example.com", "password": "SecurePass1" }
```

## POST `/api/v1/auth/refresh`

```json
{ "refreshToken": "..." }
```

## POST `/api/v1/auth/logout`

```json
{ "refreshToken": "..." }
```

## GET `/api/v1/auth/me`

Header: `Authorization: Bearer <accessToken>`
