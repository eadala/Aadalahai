# ADR-006: تنسيق الاستشهادات القانونية

**الحالة**: مقبول  
**التاريخ**: 2026-07-05  
**صاحب القرار**: Chief Architect + Documentation Engineer

## السياق

Sprint-005 يحسّن citations. الحالي يعرض chunk خام بدون تحليل مواد قانونية.

## القرار

تنسيق Citation موسّع:

```typescript
interface Citation {
  index: number;              // [1], [2] في النص
  documentId: string;
  documentTitle: string;      // اسم التشريع
  chunkContent: string;
  excerpt: string;            // المقطع الأكثر صلة
  similarity: number;
  confidence: "high" | "medium" | "low";
  articles: LegalArticle[];   // مواد مستخرجة
}

interface LegalArticle {
  number: string;
  label: string;              // "المادة 77"
  text: string;
}
```

## الاستخراج

Regex عربي:
- `المادة (\d+)`
- `م\.(\d+)`
- `الفقرة (\d+)`

## العتبات

| Similarity | Confidence |
|---|---|
| ≥ 0.7 | high |
| ≥ 0.4 | medium |
| < 0.4 | low (تُستبعد) |

## LLM Prompt

يُطلب من النموذج الإشارة للمصادر كـ `[1]`، `[2]` في الإجابة.

## العواقب

- تحديث schema TypeScript (JSONB متوافق للخلف)
- UI يعرض المواد بشكل منفصل
- تحذير عند عدم وجود مصادر
