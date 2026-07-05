# ADR-011: Arabic Legal Prompt Engineering

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-010

## السياق

الـ system prompt كان مدمجًا في `chat.service.ts` بنص قصير. للإنتاج مع OpenAI نحتاج prompts هندسية أدق للسياق القانوني العربي.

## القرار

### 1. وحدة prompts مركزية
- `apps/api/src/ai/prompts/legal-assistant.ts`
- `LEGAL_ASSISTANT_BASE_PROMPT` — تعليمات ثابتة
- `buildLegalSystemPrompt()` — يدمج السياق والمصادر

### 2. هيكل الـ prompt
| القسم | الغرض |
|---|---|
| الدور | تعريف «عدالة» كمساعد قانوني عربي |
| قواعد إلزامية | RAG-only، استشهاد [N]، عدم الاختراع |
| تنسيق الإجابة | ملخص → تفصيل → مصادر → تنبيه |
| السياق القانوني | chunks من RAG |
| قائمة المصادر | عناوين + مواد |

### 3. حالة بدون وثائق
- يرفض الإجابة من المعرفة العامة
- يوجّه المستخدم لرفع وثائق

### 4. OpenAI Live Validation
- `scripts/openai-smoke.mjs` — اختبار يدوي/CI
- `openai-live.test.ts` — يعمل فقط مع `RUN_OPENAI_LIVE=1`
- GitHub workflow يدوي مع `OPENAI_API_KEY` secret

## البدائل المرفوضة

| البديل | السبب |
|---|---|
| Prompts في DB | تعقيد مبكر — ملفات كافية للمرحلة 2 |
| Fine-tuning | مكلف — prompt engineering أولاً |
| OpenAI live في CI تلقائي | تكلفة + يدوي فقط |

## العواقب

- تحديث الـ prompt يتطلب deploy API فقط (ليس web)
- Mock LLM يحاكي تنسيق الإجابة الجديد
- 4 اختبارات prompts + optional live tests
