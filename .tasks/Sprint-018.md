# Sprint-018 — نشر VPS + smoke على adalahai.com

**الفترة**: 2026-07-05  
**الهدف**: استبدال Replit بنشر Docker على `adalahai.com` / `api.adalahai.com`  
**الحالة**: 🟡 جاهز للتنفيذ — في انتظار DNS + VPS + نشر الكود إلى `adala-ai`

## الحالة الحالية (preflight)

| الفحص | الحالة |
|---|---|
| `adalahai.com` DNS | ✅ Cloudflare (172.67.x / 104.21.x) |
| `api.adalahai.com` DNS | ❌ لا يوجد A record |
| WEB حي | ⚠️ Replit/Vite قديم (`built on Replit`) |
| API `/health` | ❌ غير قابل للوصول |
| `eadala/adala-ai` متزامن | ⏳ يتطلب `publish:adala-ai` |

## المهام

| # | المهمة | الحالة |
|---|---|---|
| 1 | نشر الكود → `eadala/adala-ai/main` | ⏳ admin |
| 2 | إيقاف Replit + إزالة custom domain | ⏳ |
| 3 | VPS bootstrap (`vps-bootstrap-adalahai.sh`) | ⏳ |
| 4 | Cloudflare: `api.adalahai.com` A → VPS IP | ❌ |
| 5 | Cloudflare: `adalahai.com` A → VPS IP | ⏳ (حالياً Replit) |
| 6 | `./scripts/cutover-adalahai.sh` | ⏳ |
| 7 | Remote smoke 19/19 | ⏳ |

## التنفيذ (بالترتيب)

### 1 — نشر الكود إلى المستودع الوحيد

```bash
# محلياً (صلاحية admin على eadala/adala-ai)
npm run publish:adala-ai

# أو GitHub Actions: Publish to adala-ai (secret ADALA_AI_SYNC_TOKEN)
```

### 2 — إعداد VPS

```bash
# على الخادم (Ubuntu/Debian)
curl -fsSL https://raw.githubusercontent.com/eadala/adala-ai/main/scripts/vps-bootstrap-adalahai.sh | bash
# أو بعد clone:
sudo ./scripts/vps-bootstrap-adalahai.sh
```

عدّل `.env.prod` ثم:

```bash
cd /opt/adala-ai
./scripts/cutover-adalahai.sh
```

### 3 — DNS (Cloudflare)

| السجل | النوع | القيمة |
|---|---|---|
| `adalahai.com` | A | IP الخادم |
| `api.adalahai.com` | A | IP الخادم |
| `www` | CNAME → apex أو A | نفس IP |

نصيحة: عطّل البروكسي (grey cloud) أثناء إصدار شهادة Caddy الأولى، ثم فعّل Full (strict).

```bash
./scripts/verify-dns.sh adalahai.com api.adalahai.com YOUR_VPS_IP
```

### 4 — إيقاف Replit

1. أوقف النشر على Replit
2. أزل `adalahai.com` من Replit custom domains

### 5 — التحقق

```bash
./scripts/preflight-adalahai.sh YOUR_VPS_IP
API_URL=https://api.adalahai.com WEB_URL=https://adalahai.com npm run prod:smoke:remote
```

أو GitHub Actions: **adalahai Remote Smoke** (اكتب `smoke`)

## معايير القبول

- [ ] `preflight-adalahai.sh` يمر بدون blockers
- [ ] `https://api.adalahai.com/health` → `{"status":"ok"}`
- [ ] `https://adalahai.com/login` → Next.js (ليس Replit)
- [ ] Remote smoke: **19/19** ✅

## المراجع

- [.docs/MIGRATION-adala-ai-cutover.md](../.docs/MIGRATION-adala-ai-cutover.md)
- [Sprint-017](./Sprint-017.md)
