# Playbook: النشر (Deployment)

## البيئات

| البيئة | الغرض | URL |
|---|---|---|
| dev | تطوير محلي | localhost |
| staging | اختبار قبل الإنتاج | TBD |
| prod | الإنتاج | TBD |

## خطوات النشر

### 1. Pre-deploy

- [ ] كل الاختبارات خضراء
- [ ] مراجعة أمنية مكتملة
- [ ] وثائق محدثة
- [ ] Migration tested على staging

### 2. Deploy to Staging

- [ ] Deploy via CI/CD
- [ ] Smoke tests
- [ ] Performance check ضد SLOs

### 3. Deploy to Production

- [ ] موافقة (approval)
- [ ] Deploy via CI/CD
- [ ] Smoke tests
- [ ] مراقبة لمدة 30 دقيقة

### 4. Post-deploy

- [ ] تحديث PROJECT_STATUS
- [ ] إشعار الفريق
- [ ] مراقبة metrics

## Rollback

إن فشل النشر:
1. Rollback تلقائي via CI/CD
2. سجّل في Bugs.md
3. حلل السبب قبل إعادة المحاولة

## المراجع

- [.ai/Agents/devops-engineer.md](../Agents/devops-engineer.md)
- [.docs/Performance/](../../.docs/Performance/)
