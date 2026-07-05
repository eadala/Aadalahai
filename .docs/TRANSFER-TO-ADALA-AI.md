# نقل العمل إلى `eadala/adala-ai`

> الكود الكامل (Sprint 001–018) موجود على `eadala/Aadalahai/main`  
> الهدف: استبدال `eadala/adala-ai/main` (Replit القديم) بالمكدس الجديد

## الفجوة الحالية

| المستودع | الحالة |
|---|---|
| [eadala/Aadalahai](https://github.com/eadala/Aadalahai) | ✅ Engineering OS (37 commit أمام) |
| [eadala/adala-ai](https://github.com/eadala/adala-ai) | ❌ Replit + Clerk + Vite |

```bash
npm run verify:sync   # يؤكد عدم المزامنة
```

---

## الطريقة 1 — سطر واحد (مالك المستودع)

### 1) أنشئ PAT

[GitHub → Settings → Developer settings → PAT](https://github.com/settings/tokens)  
صلاحية: **`repo`** على حساب يملك `eadala/adala-ai`

### 2) انشر

```bash
git clone https://github.com/eadala/Aadalahai.git
cd Aadalahai
export ADALA_AI_SYNC_TOKEN="ghp_xxxxxxxx"
npm run publish:adala-ai
```

ينفّذ تلقائياً:
- tag `legacy-replit-pre-cutover` للكود القديم
- `git push --force` للكود الجديد إلى `adala-ai/main`

### 3) تحقق

```bash
npm run verify:sync
```

يجب أن يظهر: `SYNC PASSED`

---

## الطريقة 2 — GitHub Actions

في **eadala/Aadalahai** → Settings → Secrets:

| Secret | القيمة |
|---|---|
| `ADALA_AI_SYNC_TOKEN` | PAT أعلاه |

ثم: **Actions → Publish to adala-ai → Run workflow** → اكتب `publish`

---

## الطريقة 3 — يدوياً بدون سكربت

```bash
git clone https://github.com/eadala/Aadalahai.git
cd Aadalahai
git remote add adala-ai https://github.com/eadala/adala-ai.git
git fetch adala-ai
git tag -a legacy-replit-pre-cutover -m "Legacy Replit" adala-ai/main
git push https://x-access-token:TOKEN@github.com/eadala/adala-ai.git legacy-replit-pre-cutover
git push https://x-access-token:TOKEN@github.com/eadala/adala-ai.git main:main --force
```

---

## بعد النشر

```bash
# على VPS 167.233.100.149
git clone https://github.com/eadala/adala-ai.git /opt/adala-ai
cd /opt/adala-ai
cp .env.prod.adalahai.example .env.prod
# عدّل الأسرار
./scripts/cutover-adalahai.sh
```

راجع [.docs/MIGRATION-adala-ai-cutover.md](.docs/MIGRATION-adala-ai-cutover.md)

---

## لماذا الـ Agent لا ينفّذ وحده؟

`cursor[bot]` يملك push على `Aadalahai` فقط — **ليس** على `eadala/adala-ai` (403).
