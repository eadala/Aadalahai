# حالة المشروع — عدالة

> آخر تحديث: 2026-07-05 | السبرنت: Sprint-018 🟡

## الملخص

| المؤشر | القيمة |
|---|---|
| المرحلة | 2 — الذكاء القانوني |
| السبرنت الحالي | Sprint-018 (نشر VPS + smoke حي) |
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

## Sprint-018 — نشر VPS على adalahai.com 🟡

- `scripts/preflight-adalahai.sh` — فحص DNS + Replit + API قبل القطع
- `scripts/vps-bootstrap-adalahai.sh` — إعداد VPS + clone
- workflow: `adalahai Remote Smoke` (19 اختبار على النطاق الحي)
- **حاجز حالي**: `api.adalahai.com` بدون DNS؛ الموقع لا يزال Replit

## الخطوة التالية

1. `npm run publish:adala-ai` (admin)
2. VPS + `./scripts/vps-bootstrap-adalahai.sh`
3. Cloudflare DNS → VPS IP
4. `npm run preflight:adalahai` ثم `npm run prod:smoke:remote`
