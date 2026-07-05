# Database — قاعدة البيانات

## التقنية

- **PostgreSQL 16+** كقاعدة رئيسية
- **pgvector** للبحث الدلالي
- **Redis** للـ cache والجلسات

## المبادئ

1. **كل تغيير = migration** — لا تعديل يدوي على الإنتاج
2. **تسمية**: `snake_case` للجداول والأعمدة
3. **مفاتيح**: `id` UUID كمفتاح أساسي
4. **تدقيق**: `created_at`, `updated_at` في كل جدول
5. **Soft delete**: `deleted_at` حيث يلزم

## الجداول المخططة

| الجدول | الغرض | الحالة |
|---|---|---|
| `users` | حسابات المستخدمين | ⬜ مخطط |
| `sessions` | جلسات المحادثة | ⬜ مخطط |
| `messages` | رسائل المحادثة | ⬜ مخطط |
| `documents` | وثائق قانونية مرفوعة | ⬜ مخطط |
| `document_chunks` | مقاطع مفهرسة للـ RAG | ⬜ مخطط |
| `embeddings` | متجهات المقاطع | ⬜ مخطط |

## مخطط ER (مبدئي)

```
users ──< sessions ──< messages
users ──< documents ──< document_chunks ──< embeddings
```

## الفهرسة

- `messages(session_id, created_at)` — استرجاع سريع لتاريخ المحادثة
- `embeddings` — فهرس vector (HNSW أو IVFFlat)
- `documents(user_id, status)` — قائمة وثائق المستخدم

## كيفية إضافة جدول

1. صمم في **Think** مع Database Engineer
2. وثّق هنا + أنشئ migration
3. راجع مع Security Engineer (صلاحيات، تشفير)
4. اختبر الأداء مع Performance targets
