# Sprint-010 — Arabic Prompt Engineering + OpenAI Live Validation

**الفترة**: 2026-07-05  
**الهدف**: هندسة prompts عربية + تحقق OpenAI حي  
**الحالة**: ✅ مكتمل

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | `legal-assistant.ts` prompt module | ✅ |
| 2 | Refactor ChatService + MockLLM | ✅ |
| 3 | 4 اختبارات prompts | ✅ |
| 4 | `scripts/openai-smoke.mjs` | ✅ |
| 5 | `openai-live.test.ts` (optional) | ✅ |
| 6 | GitHub workflow `openai-live.yml` | ✅ |
| 7 | ADR-011 | ✅ |

## Prompt Engineering

الـ prompt يفرض:
- الإجابة من السياق فقط (RAG)
- استشهادات `[1]`، `[2]`
- تنسيق: ملخص → تفصيل → تنبيه استشاري
- رفض الإجابة بدون وثائق

## OpenAI Live

```bash
# محلي
OPENAI_API_KEY=sk-... node scripts/openai-smoke.mjs

# أو
RUN_OPENAI_LIVE=1 OPENAI_API_KEY=sk-... npm run test -w @adalah/api -- tests/openai-live.test.ts
```

CI: Actions → **OpenAI Live Validation** → اكتب `openai`

## الخطوة التالية

Sprint-011: Analytics dashboard + lawyer onboarding
