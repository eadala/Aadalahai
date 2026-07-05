# Database — عدالة

## التقنية

- **PostgreSQL 16+** + **pgvector**
- **Drizzle ORM**

## الجداول

### `users` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| email | VARCHAR(255) UNIQUE |
| password_hash | VARCHAR(255) |
| name | VARCHAR(255) |
| role | ENUM: user, lawyer, admin |
| created_at, updated_at | TIMESTAMPTZ |

### `refresh_tokens` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| user_id | UUID FK → users |
| token_hash | VARCHAR(64) UNIQUE |
| expires_at | TIMESTAMPTZ |
| revoked_at | TIMESTAMPTZ NULL |

### `chat_sessions` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| user_id | UUID FK → users |
| title | VARCHAR(255) |
| created_at, updated_at | TIMESTAMPTZ |

### `messages` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| session_id | UUID FK → chat_sessions |
| role | ENUM: user, assistant, system |
| content | TEXT |
| citations | JSONB |
| created_at | TIMESTAMPTZ |

### `documents` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| user_id | UUID FK → users |
| title | VARCHAR(255) |
| content | TEXT |
| status | ENUM: processing, ready, failed |
| created_at, updated_at | TIMESTAMPTZ |

### `document_chunks` ✅
| العمود | النوع |
|---|---|
| id | UUID PK |
| document_id | UUID FK → documents |
| content | TEXT |
| chunk_index | INTEGER |
| embedding | vector(384) |
| created_at | TIMESTAMPTZ |

## مخطط ER

```
users ──< refresh_tokens
users ──< chat_sessions ──< messages
users ──< documents ──< document_chunks (embedding)
```

## Migrations

```
0000_bright_may_parker.sql  ← users + refresh_tokens
0001_glamorous_hellion.sql  ← chat + documents + pgvector
```

## Vector Search

```sql
SELECT content, 1 - (embedding <=> $query_vector) AS similarity
FROM document_chunks
ORDER BY embedding <=> $query_vector
LIMIT 5;
```
