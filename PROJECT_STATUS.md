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

## Sprint-018 — استبدال Replit 🔴

- Replit **متوقف** — الموقع يحتاج VPS فوراً
- workflow جديد: **VPS Deploy adalahai.com** (SSH + Docker)
- `write-prod-env.sh` + bootstrap من `Aadalahai` (الكود الفعلي)

## الخطوة التالية (عاجل)

1. أضف GitHub secrets: `VPS_HOST`, `VPS_SSH_PRIVATE_KEY`, `PROD_*`
2. شغّل workflow **VPS Deploy adalahai.com** (اكتب `deploy`)
3. Cloudflare: `adalahai.com` + `api.adalahai.com` → IP الخادم
4. `npm run prod:smoke:remote`
