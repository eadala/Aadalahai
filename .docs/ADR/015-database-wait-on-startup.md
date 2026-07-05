# ADR-015: Database Wait on Container Startup

**التاريخ**: 2026-07-05  
**الحالة**: مقبول  
**السبرنت**: Sprint-014

## السياق

عند `docker compose up`، حاوية API تبدأ أحيانًا قبل جاهزية PostgreSQL للاتصالات TCP، مما يفشل migrations ويُعلِم healthcheck بـ unhealthy.

## القرار

- إضافة `docker/wait-for-db.mjs` قبل migrations في `api-entrypoint.sh`
- زيادة `connect_timeout` في `migrate.ts` إلى 30 ثانية
- نسخ `wait-for-db.mjs` في `Dockerfile.api`

## العواقب

- بدء API أكثر موثوقية على Staging/Production
- تأخير بسيط (~2–60 ثانية) عند أول تشغيل
