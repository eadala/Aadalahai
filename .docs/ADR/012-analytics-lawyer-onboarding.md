# ADR-012: Analytics Dashboard + Lawyer Onboarding

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-011

## السياق

بعد إكمال النواة والإنتاج (Sprint-006–010)، نحتاج:
1. لوحة إحصائيات للمستخدمين والمحامين
2. مسار تسجيل المحامي (onboarding) لترقية الدور من `user` إلى `lawyer`

## القرار

### 1. جدول `lawyer_profiles`
- مفتاح أساسي: `user_id` (FK → `users`)
- حقول: `license_number`, `specialization`, `bar_association`, `phone`, `completed_at`
- Migration: `0002_lawyer_profiles.sql`

### 2. Analytics API
- `GET /api/v1/analytics/me` — إحصائيات المستخدم الحالي
- تجميع من `chat_sessions`, `messages`, `documents`
- لا تخزين منفصل — استعلامات مباشرة (MVP)

### 3. Onboarding API
- `GET /api/v1/onboarding/status` — حالة التسجيل
- `POST /api/v1/onboarding/lawyer` — إكمال التسجيل + ترقية الدور
- تحقق Zod + رفض التكرار (409)

### 4. Web UI
- `/dashboard` — لوحة إحصائيات
- `/onboarding` — نموذج تسجيل المحامي
- `AuthForm` — اختيار نوع الحساب عند التسجيل

### 5. SDK
- `client.analytics.me()`
- `client.onboarding.getStatus()` / `completeLawyer()`

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| جدول analytics منفصل | تعقيد مبكر — aggregation كافٍ للمرحلة 2 |
| تسجيل محامٍ عند register مباشرة | يتطلب بيانات مهنية — onboarding منفصل أفضل |
| لوحة admin منفصلة | خارج نطاق Sprint-011 |

## العواقب

- 5 اختبارات API جديدة (analytics + onboarding)
- صفحتان web جديدتان (`/dashboard`, `/onboarding`)
- ADR-012 + تحديث OpenAPI
