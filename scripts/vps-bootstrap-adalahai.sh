#!/usr/bin/env bash
# Bootstrap a fresh VPS for adalahai.com production (run ON the server as root/sudo)
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/eadala/Aadalahai.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/adala-ai}"
BRANCH="${BRANCH:-main}"

echo "=== VPS bootstrap: adalahai.com ==="
echo "Repo:  $REPO_URL"
echo "Dir:   $INSTALL_DIR"
echo "Branch: $BRANCH"
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: docker compose plugin required" >&2
  exit 1
fi

mkdir -p "$(dirname "$INSTALL_DIR")"
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Updating existing clone..."
  git -C "$INSTALL_DIR" fetch origin
  git -C "$INSTALL_DIR" checkout "$BRANCH"
  git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
chmod +x scripts/*.sh

if [ ! -f .env.prod ]; then
  cp .env.prod.adalahai.example .env.prod
  echo ""
  echo "Created .env.prod — EDIT SECRETS before deploy:"
  echo "  nano $INSTALL_DIR/.env.prod"
  echo "  JWT_SECRET, POSTGRES_PASSWORD, OPENAI_API_KEY"
  echo ""
  echo "Then run:"
  echo "  cd $INSTALL_DIR && ./scripts/cutover-adalahai.sh"
  exit 0
fi

echo "Found .env.prod — running cutover..."
./scripts/cutover-adalahai.sh
