# ADR-013: Document Analysis MVP

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-012

## السياق

المرحلة 2 تتطلب «تحليل عقود ومستندات». الوثائق حاليًا تُفهرس للـ RAG فقط دون تحليل مباشر عند الرفع.

## القرار

### 1. جدول `document_analyses`
- تخزين نتائج التحليل لكل طلب (ليس cache تلقائي عند إعادة الرفع)
- حقول: `summary`, `key_clauses`, `risks`, `recommendations` (jsonb)

### 2. API
- `POST /api/v1/documents/:id/analyze` — تحليل وثيقة `ready`
- `GET /api/v1/documents/:id/analyses` — قائمة التحليلات

### 3. Prompt منفصل
- `document-analysis.ts` — ليس RAG chat prompt
- يطلب JSON منظم من LLM
- Mock LLM يُرجع JSON ثابت للاختبارات

### 4. توسيع Analytics
- `lawyerProfile`, `recentSessions`, `recentDocuments`, `totalAnalyses`

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| تحليل عند الرفع تلقائيًا | تكلفة LLM + بطء الرفع |
| تحليل streaming | تعقيد UI مبكر |
| تحليل للمحامين فقط | MVP مفتوح لجميع المستخدمين |

## العواقب

- كل تحليل = استدعاء LLM واحد
- Dashboard يعرض نشاطًا أخيرًا وملف المحامي
- Smoke tests تشمل analyze + analytics
