# ADR-016: Shared Legislation Corpus

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-015

## السياق

بحث Sprint-013 يقتصر على وثائق المستخدم. المرحلة 2 تتطلب corpus تشريعات خارجي مشترك.

## القرار

### 1. جداول منفصلة
- `legislation_sources` — عنوان، فئة، اختصاص
- `legislation_chunks` — مواد مفهرسة مع embeddings

### 2. Seed idempotent
- `LegislationService.seedCorpusIfEmpty()` — نظام العمل + الإجراءات الجزائية (MVP)
- يُشغَّل بعد migrations في Docker entrypoint و E2E global-setup

### 3. Search scope
- `GET /api/v1/search?scope=all|user|legislation`
- دمج نتائج التشريعات مع وثائق المستخدم عند `scope=all`

### 4. API listing
- `GET /api/v1/legislation` — قائمة مصادر التشريعات

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| دمج التشريعات في `documents` | يخلط ملكية المستخدم مع corpus نظامي |
| corpus خارجي (S3/API) | تعقيد بنية — DB seed كافٍ للمرحلة 2 |

## العواقب

- migration `0004`
- smoke +2 (corpus list, legislation search)
- أساس لتوسيع corpus لاحقًا بدون تغيير API
