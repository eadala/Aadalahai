#!/usr/bin/env bash
# Verify DNS A records for production cutover
set -euo pipefail

DOMAIN="${1:-adalahai.com}"
API_DOMAIN="${2:-api.$DOMAIN}"
EXPECTED_IP="${3:-}"

echo "Checking DNS for production cutover..."
echo "  WEB: $DOMAIN"
echo "  API: $API_DOMAIN"

resolve() {
  dig +short "$1" A 2>/dev/null | head -1 || true
}

WEB_IP=$(resolve "$DOMAIN")
API_IP=$(resolve "$API_DOMAIN")
WWW_IP=$(resolve "www.$DOMAIN")

echo ""
echo "  $DOMAIN        → ${WEB_IP:-<no A record>}"
echo "  www.$DOMAIN    → ${WWW_IP:-<no A record>}"
echo "  $API_DOMAIN    → ${API_IP:-<no A record>}"

if [ -n "$EXPECTED_IP" ]; then
  if [ "$WEB_IP" != "$EXPECTED_IP" ]; then
    echo "FAIL: $DOMAIN should point to $EXPECTED_IP (got ${WEB_IP:-none})"
    exit 1
  fi
  if [ "$API_IP" != "$EXPECTED_IP" ]; then
    echo "FAIL: $API_DOMAIN should point to $EXPECTED_IP (got ${API_IP:-none})"
    exit 1
  fi
  echo "OK: DNS matches expected server IP $EXPECTED_IP"
else
  if [ -z "$WEB_IP" ] || [ -z "$API_IP" ]; then
    echo "WARN: Missing A records — configure before cutover"
    exit 1
  fi
  echo "OK: A records present"
fi
