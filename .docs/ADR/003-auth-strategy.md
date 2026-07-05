# ADR-003: استراتيجية المصادقة

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect + Security Engineer  
**يحل محل**: —

## السياق

Sprint-002 يبني Auth. نحتاج استراتيجية آمنة وقابلة للتوسع.

## الخيارات المدروسة

### الخيار 1: Server-side Sessions (Redis)
- **المزايا**: إلغاء فوري، بسيط
- **التنازلات**: أصعب للـ mobile/API clients، stateful

### الخيار 2: JWT فقط (stateless)
- **المزايا**: بسيط، scalable
- **التنازلات**: لا إلغاء فوري، refresh token theft خطر

### الخيار 3: JWT + Refresh Token Rotation (المختار)
- **المزايا**: access token قصير (15min)، refresh في DB مع rotation، إلغاء ممكن
- **التنازلات**: أكثر تعقيدًا قليلًا

## القرار

**JWT Access Token (15 دقيقة) + Refresh Token (7 أيام) مع rotation**

| العنصر | التفاصيل |
|---|---|
| Access Token | JWT, 15min, يحمل `sub`, `email`, `role` |
| Refresh Token | random 64 bytes, hashed (SHA-256) في DB |
| Rotation | كل refresh يُلغي القديم ويُصدر جديد |
| Password | argon2id |
| Logout | revoke refresh token |

## Endpoints

| Method | Path | الوصف |
|---|---|---|
| POST | `/api/v1/auth/register` | تسجيل |
| POST | `/api/v1/auth/login` | دخول |
| POST | `/api/v1/auth/refresh` | تجديد access token |
| POST | `/api/v1/auth/logout` | خروج (revoke refresh) |
| GET | `/api/v1/auth/me` | المستخدم الحالي |

## العواقب

- جدول `users` + جدول `refresh_tokens`
- JWT secret في environment variable
- Rate limiting على auth endpoints (لاحقًا)

## المراجع

- [.docs/Security/](../Security/)
