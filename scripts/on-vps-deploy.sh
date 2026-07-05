#!/usr/bin/env bash
# Run ON the VPS (167.233.100.149) after: ssh root@167.233.100.149
# Replaces Coolify/Replit stack with Engineering OS Docker + Caddy
set -euo pipefail

INSTALL_DIR="${INSTALL_DIR:-/opt/adala-ai}"
REPO_URL="${REPO_URL:-https://github.com/eadala/Aadalahai.git}"

echo "=== adala-ai production deploy on VPS ==="

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" fetch origin && git -C "$INSTALL_DIR" checkout main && git -C "$INSTALL_DIR" pull --ff-only origin main
else
  git clone --branch main "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
chmod +x scripts/*.sh

if [ ! -f .env.prod ]; then
  cp .env.prod.adalahai.example .env.prod
  echo ""
  echo "Edit secrets then re-run:"
  echo "  nano $INSTALL_DIR/.env.prod"
  echo "  cd $INSTALL_DIR && ./scripts/cutover-adalahai.sh"
  exit 1
fi

# Stop conflicting listeners on 80/443 if old Coolify app still running
if docker ps --format '{{.Names}}' | grep -qE 'coolify|caddy|adalah'; then
  echo "Stopping existing containers on 80/443..."
  docker ps -q | xargs -r docker stop 2>/dev/null || true
fi

./scripts/cutover-adalahai.sh .env.prod

echo ""
echo "=== Next: Cloudflare DNS ==="
echo "  adalahai.com      A → 167.233.100.149"
echo "  api.adalahai.com  A → 167.233.100.149"
echo ""
curl -fsS ifconfig.me 2>/dev/null || true
echo ""
echo "Smoke: API_URL=https://api.adalahai.com WEB_URL=https://adalahai.com npm run prod:smoke:remote"
