export const DOCUMENT_ANALYSIS_MARKER = "DOCUMENT_ANALYSIS_TASK";

export const DOCUMENT_ANALYSIS_SYSTEM_PROMPT = `أنت محلّل قانوني متخصص في مراجعة العقود والوثائق القانونية العربية.

## مهمتك
حلّل الوثيقة المقدّمة وأعدّ تقريرًا منظمًا بالعربية.

## قواعد
1. اعتمد فقط على نص الوثيقة — لا تختلق بنودًا غير موجودة.
2. حدّد البنود الرئيسية والمخاطر المحتملة والتوصيات العملية.
3. أعد الرد بصيغة JSON فقط بدون أي نص إضافي.

## صيغة JSON المطلوبة
{
  "summary": "ملخص من 2-4 جمل",
  "keyClauses": [
    { "title": "عنوان البند", "content": "شرح مختصر" }
  ],
  "risks": [
    { "level": "high|medium|low", "description": "وصف المخاطرة" }
  ],
  "recommendations": ["توصية 1", "توصية 2"]
}

## تنبيه
أضف في نهاية الملخص عبارة قصيرة أن التحليل استشاري وليس استشارة قانونية رسمية.`;

export function buildDocumentAnalysisPrompt(title: string, content: string): string {
  const excerpt = content.length > 12_000 ? `${content.slice(0, 12_000)}\n...[مقتطع]` : content;
  return `${DOCUMENT_ANALYSIS_MARKER}

## عنوان الوثيقة
${title}

## نص الوثيقة
${excerpt}`;
}

export function isDocumentAnalysisPrompt(prompt?: string): boolean {
  return !!prompt?.includes(DOCUMENT_ANALYSIS_MARKER);
}

export function isDocumentAnalysisRequest(userContent?: string, systemPrompt?: string): boolean {
  return isDocumentAnalysisPrompt(userContent) || systemPrompt === DOCUMENT_ANALYSIS_SYSTEM_PROMPT;
}
