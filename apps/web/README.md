# @adalah/web

واجهة محادثة عدالة — Next.js + Arabic RTL

## التشغيل

```bash
# من جذر المشروع — شغّل API أولاً
npm run dev:api

# ثم الواجهة
npm run dev:web
# → http://localhost:3000
```

## المتغيرات

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## الصفحات

| المسار | الوصف |
|---|---|
| `/login` | تسجيل الدخول |
| `/register` | إنشاء حساب |
| `/chat` | واجهة المحادثة + streaming |
| `/documents` | رفع وإدارة الوثائق |

## الميزات

- RTL عربي + خط Tajawal
- SSE streaming للإجابات
- عرض citations من RAG
- رفع وثائق قانونية
- JWT auth مع auto-refresh
