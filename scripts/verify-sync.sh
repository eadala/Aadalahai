#!/usr/bin/env bash
# Quick sync check: local/Aadalahai vs eadala/adala-ai
set -euo pipefail

git fetch origin -q 2>/dev/null || true
git fetch adala-ai -q 2>/dev/null || true

LOCAL=$(git rev-parse main)
ORIGIN=$(git rev-parse origin/main 2>/dev/null || echo "missing")
ADALA=$(git rev-parse adala-ai/main 2>/dev/null || echo "missing")

echo "=== Sync verification ==="
echo "local main:     $(git log -1 --oneline main)"
echo "Aadalahai:      $(git log -1 --oneline origin/main 2>/dev/null || echo 'unreachable')"
echo "eadala/adala-ai: $(git log -1 --oneline adala-ai/main 2>/dev/null || echo 'unreachable')"
echo ""

SYNCED=0

if [ "$LOCAL" = "$ORIGIN" ]; then
  echo "OK: Aadalahai/main matches local"
else
  echo "BLOCKER: Aadalahai/main differs from local"
  SYNCED=1
fi

if [ "$LOCAL" = "$ADALA" ]; then
  echo "OK: eadala/adala-ai/main matches local (canonical repo synced)"
else
  AHEAD=$(git rev-list --count adala-ai/main..main 2>/dev/null || echo "?")
  echo "BLOCKER: eadala/adala-ai/main out of sync ($AHEAD commits ahead)"
  echo "        Run: npm run publish:adala-ai"
  SYNCED=1
fi

if git ls-remote --tags adala-ai legacy-replit-pre-cutover 2>/dev/null | grep -q legacy-replit-pre-cutover; then
  echo "OK: tag legacy-replit-pre-cutover on adala-ai"
else
  echo "WARN: tag legacy-replit-pre-cutover not on adala-ai remote"
fi

echo ""
if [ "$SYNCED" -eq 0 ]; then
  echo "SYNC PASSED — all repos aligned"
  exit 0
fi
echo "SYNC FAILED — publish required before VPS cutover"
exit 1
