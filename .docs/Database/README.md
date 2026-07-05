# Database — عدالة

## التقنية

- **PostgreSQL 16+**
- **Drizzle ORM** للـ migrations والاستعلامات
- **Redis** للـ cache (Sprint لاحق)

## الجداول

### `users`

| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID PK | معرف فريد |
| `email` | VARCHAR(255) UNIQUE | البريد الإلكتروني |
| `password_hash` | VARCHAR(255) | argon2id hash |
| `name` | VARCHAR(255) | الاسم |
| `role` | ENUM | `user` \| `lawyer` \| `admin` |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |
| `updated_at` | TIMESTAMPTZ | تاريخ التحديث |

### `refresh_tokens`

| العمود | النوع | الوصف |
|---|---|---|
| `id` | UUID PK | معرف فريد |
| `user_id` | UUID FK → users | المستخدم |
| `token_hash` | VARCHAR(64) UNIQUE | SHA-256 hash |
| `expires_at` | TIMESTAMPTZ | تاريخ الانتهاء |
| `revoked_at` | TIMESTAMPTZ NULL | تاريخ الإلغاء |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء |

## مخطط ER

```
users ──< refresh_tokens
```

## Migrations

```
apps/api/src/db/migrations/
  0000_bright_may_parker.sql   ← users + refresh_tokens
```

**تشغيل:**
```bash
npm run db:migrate
```

**إنشاء migration جديد:**
```bash
npm run db:generate
```

## الجداول المخططة (لاحقًا)

| الجدول | الغرض | السبرنت |
|---|---|---|
| `sessions` | جلسات المحادثة | Sprint-003 |
| `messages` | رسائل المحادثة | Sprint-003 |
| `documents` | وثائق قانونية | Sprint-004 |
| `document_chunks` | مقاطع RAG | Sprint-004 |
| `embeddings` | متجهات | Sprint-004 |
