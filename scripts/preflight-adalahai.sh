#!/usr/bin/env bash
# Pre-flight checks before adalahai.com cutover (Sprint-018)
set -euo pipefail

WEB_DOMAIN="${WEB_DOMAIN:-adalahai.com}"
API_DOMAIN="${API_DOMAIN:-api.adalahai.com}"
EXPECTED_IP="${1:-}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BLOCKERS=0

warn() { echo "WARN: $*"; }
fail() { echo "BLOCKER: $*"; BLOCKERS=$((BLOCKERS + 1)); }
ok() { echo "OK: $*"; }

echo "=== adalahai.com cutover preflight ==="
echo "WEB: $WEB_DOMAIN"
echo "API: $API_DOMAIN"
echo ""

resolve() {
  dig +short "$1" A 2>/dev/null | head -1 || true
}

WEB_IP=$(resolve "$WEB_DOMAIN")
API_IP=$(resolve "$API_DOMAIN")

if [ -n "$WEB_IP" ]; then
  ok "$WEB_DOMAIN resolves → $WEB_IP"
else
  fail "$WEB_DOMAIN has no A record"
fi

if [ -n "$API_IP" ]; then
  ok "$API_DOMAIN resolves → $API_IP"
else
  fail "$API_DOMAIN has no A record (create in Cloudflare before cutover)"
fi

if [ -n "$EXPECTED_IP" ]; then
  if [ "$WEB_IP" != "$EXPECTED_IP" ]; then
    fail "$WEB_DOMAIN should point to $EXPECTED_IP (got ${WEB_IP:-none})"
  fi
  if [ -n "$API_IP" ] && [ "$API_IP" != "$EXPECTED_IP" ]; then
    fail "$API_DOMAIN should point to $EXPECTED_IP (got $API_IP)"
  fi
fi

echo ""
echo "--- Live endpoints ---"

if curl -fsS --max-time 15 "https://$API_DOMAIN/health" >/dev/null 2>&1; then
  API_HEALTH=$(curl -fsS --max-time 15 "https://$API_DOMAIN/health" 2>/dev/null || true)
  if echo "$API_HEALTH" | grep -q '"status":"ok"'; then
    ok "API /health returns Engineering OS stack"
  else
    warn "API /health reachable but unexpected body: ${API_HEALTH:0:120}"
  fi
else
  fail "API https://$API_DOMAIN/health not reachable"
fi

WEB_HTML=$(curl -fsS --max-time 15 "https://$WEB_DOMAIN/" 2>/dev/null || true)
if [ -z "$WEB_HTML" ]; then
  fail "WEB https://$WEB_DOMAIN/ not reachable"
elif echo "$WEB_HTML" | grep -qi "built on Replit"; then
  fail "WEB still serves legacy Replit/Vite app — stop Replit and deploy Docker stack"
elif echo "$WEB_HTML" | grep -qiE 'next|__NEXT_DATA__|adalah'; then
  ok "WEB appears to serve new stack (not Replit)"
else
  warn "WEB reachable but stack identity unclear — verify manually"
fi

LOGIN_CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "https://$WEB_DOMAIN/login" 2>/dev/null || echo "000")
if [ "$LOGIN_CODE" = "200" ]; then
  ok "WEB /login returns 200"
else
  fail "WEB /login returned $LOGIN_CODE"
fi

echo ""
echo "--- Repository sync ---"
if git remote get-url adala-ai >/dev/null 2>&1; then
  git fetch adala-ai -q 2>/dev/null || true
  if git rev-parse adala-ai/main >/dev/null 2>&1; then
    LOCAL=$(git rev-parse main 2>/dev/null || echo "")
    REMOTE=$(git rev-parse adala-ai/main 2>/dev/null || echo "")
    if [ -n "$LOCAL" ] && [ "$LOCAL" = "$REMOTE" ]; then
      ok "eadala/adala-ai/main matches local main"
    else
      fail "eadala/adala-ai/main out of sync — run: npm run publish:adala-ai"
    fi
  else
    warn "Cannot read adala-ai/main (check remote access)"
  fi
else
  warn "Remote adala-ai not configured — skip repo sync check"
fi

echo ""
if [ "$BLOCKERS" -gt 0 ]; then
  echo "Preflight FAILED: $BLOCKERS blocker(s). Fix before cutover."
  echo "See .tasks/Sprint-018.md and .docs/MIGRATION-adala-ai-cutover.md"
  exit 1
fi

echo "Preflight PASSED — safe to run ./scripts/cutover-adalahai.sh on VPS"
exit 0
