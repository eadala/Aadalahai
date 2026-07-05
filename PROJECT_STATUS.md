# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-017 ✅

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني |
| السبرنت الحالي | Sprint-018 (نشر VPS) |
| ADRs | 18 |
| API Tests | 75 ✅ |
| SDK Tests | 11 ✅ |
| E2E Tests | 7 ✅ |
| Smoke Tests | 19 ✅ |
| النطاق المستهدف | `adalahai.com` |

## Sprint-017 — adala-ai على adalahai.com ✅

- نفس المستودع `eadala/adala-ai` — استبدال كود Replit (لا مستودع `Aadalahai` منفصل)
- `.env.prod.adalahai.example` + `cutover-adalahai.sh` + `publish-to-adala-ai.sh`
- tag `legacy-replit-pre-cutover` للكود القديم
- workflow: `Publish to adala-ai` (يتطلب secret `ADALA_AI_SYNC_TOKEN`)

## الخطوة التالية

Sprint-018:
1. `./scripts/publish-to-adala-ai.sh` (أو workflow) — دفع `main` إلى `eadala/adala-ai`
2. VPS + DNS + `./scripts/cutover-adalahai.sh`
3. smoke على https://adalahai.com
