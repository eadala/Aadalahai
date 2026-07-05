#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env.prod}"
BASE="$ROOT_DIR/docker-compose.prod.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Copy .env.prod.example first."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

COMPOSE_ARGS=(-f "$BASE" --env-file "$ENV_FILE")
MODE="direct"

if [ -n "${DOMAIN:-}" ] && [ "$DOMAIN" != "localhost" ]; then
  MODE="https"
  export WEB_DOMAIN="${WEB_DOMAIN:-$DOMAIN}"
  export API_DOMAIN="${API_DOMAIN:-api.$DOMAIN}"
  export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://$API_DOMAIN}"
  export CORS_ORIGINS="${CORS_ORIGINS:-https://$WEB_DOMAIN}"
  COMPOSE_ARGS+=(-f "$ROOT_DIR/docker-compose.prod.https.yml")
  echo "HTTPS mode: WEB=$WEB_DOMAIN API=$API_DOMAIN"
else
  echo "Direct ports mode"
fi

cd "$ROOT_DIR"
docker compose "${COMPOSE_ARGS[@]}" up -d --build --wait

echo ""
echo "Production deployed ($MODE)"
if [ "$MODE" = "https" ]; then
  echo "  Web: https://${WEB_DOMAIN}"
  echo "  API: https://${API_DOMAIN}"
else
  echo "  Web: http://localhost:${WEB_PORT:-3000}"
  echo "  API: http://localhost:${API_PORT:-3001}"
fi
echo "Smoke: npm run prod:smoke"
