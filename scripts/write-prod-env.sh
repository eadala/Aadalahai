#!/usr/bin/env bash
# Write .env.prod for adalahai.com from environment variables (CI / VPS automation)
set -euo pipefail

OUT="${1:-.env.prod}"

: "${JWT_SECRET:?JWT_SECRET required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD required}"
: "${OPENAI_API_KEY:?OPENAI_API_KEY required}"

cat > "$OUT" <<EOF
POSTGRES_USER=adalah
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=adalah

JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=7

DOMAIN=adalahai.com
WEB_DOMAIN=adalahai.com
API_DOMAIN=api.adalahai.com
ACME_EMAIL=${ACME_EMAIL:-admin@adalahai.com}

NEXT_PUBLIC_API_URL=https://api.adalahai.com
CORS_ORIGINS=https://adalahai.com,https://www.adalahai.com

LLM_PROVIDER=openai
EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
OPENAI_EMBEDDING_MODEL=${OPENAI_EMBEDDING_MODEL:-text-embedding-3-small}
OPENAI_TIMEOUT_MS=30000
OPENAI_MAX_RETRIES=2
EMBEDDING_DIMENSIONS=1536

METRICS_ENABLED=true
API_PORT=3001
WEB_PORT=3000
EOF

echo "Wrote $OUT"
