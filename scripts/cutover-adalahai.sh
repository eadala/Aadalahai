#!/usr/bin/env bash
# Production cutover: deploy Aadalahai stack for adalahai.com
# Replaces legacy adala-ai (Replit/Clerk) deployment
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env.prod}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  echo "  cp .env.prod.adalahai.example .env.prod"
  echo "  Edit secrets (JWT_SECRET, POSTGRES_PASSWORD, OPENAI_API_KEY)"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [ "${DOMAIN:-}" != "adalahai.com" ]; then
  echo "WARN: DOMAIN is '${DOMAIN:-empty}', expected adalahai.com for cutover"
fi

if [[ "${JWT_SECRET:-}" == *CHANGE_ME* ]] || [[ "${POSTGRES_PASSWORD:-}" == *CHANGE_ME* ]]; then
  echo "Error: Replace placeholder secrets in $ENV_FILE before production deploy"
  exit 1
fi

echo "=== Pre-flight ==="
if command -v dig >/dev/null 2>&1; then
  "$ROOT_DIR/scripts/verify-dns.sh" "${WEB_DOMAIN:-adalahai.com}" "${API_DOMAIN:-api.adalahai.com}" || true
fi

echo ""
echo "=== Deploy HTTPS stack (Aadalahai) ==="
export DOMAIN WEB_DOMAIN API_DOMAIN ACME_EMAIL NEXT_PUBLIC_API_URL CORS_ORIGINS
"$ROOT_DIR/scripts/deploy-prod.sh" "$ENV_FILE"

echo ""
echo "=== Local smoke (stack health) ==="
API_URL="http://localhost:${API_PORT:-3001}" WEB_URL="http://localhost:${WEB_PORT:-3000}" \
  node "$ROOT_DIR/scripts/production-smoke.mjs"

echo ""
echo "=== Cutover checklist ==="
echo "  1. Stop legacy Replit/Coolify deployment (eadala/adala-ai)"
echo "  2. Cloudflare: point A records to THIS server IP"
echo "     - adalahai.com → server"
echo "     - api.adalahai.com → server"
echo "  3. Cloudflare SSL: Full (strict) after Caddy certs issued"
echo "     Tip: grey-cloud DNS during first cert, then re-enable proxy"
echo "  4. Verify:"
echo "     curl https://api.adalahai.com/health"
echo "     curl -I https://adalahai.com/login"
echo "  5. Run remote smoke:"
echo "     API_URL=https://api.adalahai.com WEB_URL=https://adalahai.com npm run prod:smoke"
echo ""
echo "Done. Legacy Clerk/Stripe app (adala-ai) can be archived after validation."
