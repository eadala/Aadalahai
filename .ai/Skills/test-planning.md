# Skill: تخطيط الاختبارات

## متى تُستخدم

مرحلة **Plan** — بعد اختيار التصميم.

## الخطوات

1. **حدد المسارات الحرجة** (critical paths)
2. **حدد أنواع الاختبارات المطلوبة**:
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests (إن لزم)
3. **اكتب حالات الاختبار** لكل نوع
4. **حدد edge cases**
5. **حدد هدف التغطية** (≥ 80%)

## المخرج

```markdown
## خطة اختبار: [اسم الميزة]

### المسارات الحرجة
1. ...

### Unit Tests
| # | الحالة | المدخلات | النتيجة المتوقعة |
|---|---|---|---|
| 1 | سعيدة | | |
| 2 | فاشلة | | |
| 3 | حدية | | |

### Integration Tests
...

### E2E Tests
...

### Edge Cases
- ...

### هدف التغطية: X%
```

## المراجع

- [.ai/Agents/qa-engineer.md](../Agents/qa-engineer.md)
- [.cursor/rules/testing.mdc](../../.cursor/rules/testing.mdc)
