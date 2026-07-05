# خارطة الطريق — عدالة

> آخر تحديث: Sprint-011 | الحالة: **مرحلة 2 جارية**

## المراحل

### المرحلة 0 — Engineering OS ✅

- [x] هيكل المجلدات (`.docs/`, `.ai/`, `.tasks/`, `.cursor/`)
- [x] وثائق الرؤية والمعمارية
- [x] نظام ADR (7 وثائق)
- [x] فريق الوكلاء الافتراضي
- [x] سير عمل Think → Plan → Build → Review
- [x] قواعد Cursor
- [x] CI/CD pipeline (test + e2e + build)
- [x] بيئة تطوير محلية موحدة

### المرحلة 1 — النواة (Core Platform) ✅

- [x] مصادقة المستخدمين (Auth)
- [x] إدارة الجلسات والمحادثات
- [x] RAG pipeline للوثائق القانونية
- [x] واجهة محادثة أساسية (عربي RTL)
- [x] API REST أساسي
- [x] استشهاد بالمصادر (citations)
- [x] User profile
- [x] API SDK (`@adalah/sdk`)
- [x] نشر إنتاجي (Docker)

### المرحلة 2 — الذكاء القانوني

- [x] OpenAI integration (providers + env + error handling)
- [x] Production monitoring (health, ready, metrics)
- [x] Prompt engineering للسياق القانوني العربي
- [x] OpenAI live validation
- [ ] Fine-tuning
- [ ] تحليل عقود ومستندات
- [ ] بحث في التشريعات والسوابق

### المرحلة 3 — المنصة المتكاملة

- [x] لوحة تحكم للمحامين (MVP — Sprint-011)
- [ ] تكامل مع أنظمة إدارة القضايا
- [ ] API عام للمطورين
- [ ] تطبيق جوال

### المرحلة 4 — النضج والتوسع

- [ ] Multi-tenancy لمكاتب المحاماة
- [ ] امتثال تنظيمي (GDPR, local regulations)
- [ ] مراقبة وتحليلات متقدمة
- [ ] 100+ وثيقة هندسية مكتملة

## المعالم

| المعلم | السبرنت | الحالة |
|---|---|---|
| Engineering OS | Sprint-001 | ✅ |
| Auth + User model | Sprint-002 | ✅ |
| RAG MVP | Sprint-003 | ✅ |
| Chat UI v1 | Sprint-004 | ✅ |
| Citations + UX | Sprint-005 | ✅ |
| API SDK + Deploy | Sprint-006 | ✅ |
| OpenAI + Monitoring | Sprint-007 | ✅ |
| Staging + Smoke tests | Sprint-008 | ✅ |
| Production + HTTPS | Sprint-009 | ✅ |
| Prompt engineering | Sprint-010 | ✅ |
| Analytics + Onboarding | Sprint-011 | ✅ |

## كيفية تحديث هذه الوثيقة

عند إكمال معلم: غيّر الحالة في الجدول وحدّث `PROJECT_STATUS.md`.  
عند إضافة مرحلة جديدة: أنشئ ADR يشرح السبب.
