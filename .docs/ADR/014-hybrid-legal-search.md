# ADR-014: Hybrid Legal Search

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-013

## السياق

المرحلة 2 تتطلب «بحث في التشريعات والسوابق». حاليًا البحث متاح فقط ضمن مسار المحادثة (RAG في Chat).

## القرار

### 1. Search API مستقل
- `GET /api/v1/search?q=...&limit=...`
- يبحث في وثائق المستخدم المفهرسة فقط (MVP)

### 2. بحث هجين (Hybrid)
- **Vector** (70%): pgvector عبر `RAGService.retrieve`
- **Keyword** (30%): `ILIKE` على `document_chunks.content`
- دمج النتائج وترتيبها حسب `score` مركّب

### 3. تحسين تحليل الوثائق
- `GET /api/v1/documents/:id/analyses/latest` — آخر تحليل دون جلب القائمة كاملة

### 4. Web
- صفحة `/search` مع عرض المقتطفات ونوع التطابق

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| Elasticsearch منفصل | تعقيد بنية مبكر |
| بحث في corpus خارجي | لا يوجد مصدر تشريعات بعد |
| pg tsvector فقط | Vector أفضل للعربية القانونية في MVP |

## العواقب

- لا migration جديد — يعيد استخدام `document_chunks`
- Smoke + E2E لمسار البحث
- أساس لـ Sprint-014 (corpus تشريعات خارجي)
