#!/usr/bin/env bash
# One-time (or repeatable) sync: Engineering OS main → eadala/adala-ai
# Requires admin/write access to eadala/adala-ai
set -euo pipefail

TARGET_REPO="${TARGET_REPO:-git@github.com:eadala/adala-ai.git}"
LEGACY_TAG="${LEGACY_TAG:-legacy-replit-pre-cutover}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-adala-ai}"

echo "=== Publish to eadala/adala-ai (same repo, same name) ==="
echo "Source branch: ${SOURCE_BRANCH}"
echo "Target:        ${TARGET_REPO}"
echo ""

if ! git rev-parse --verify "${SOURCE_BRANCH}" >/dev/null 2>&1; then
  echo "ERROR: branch ${SOURCE_BRANCH} not found" >&2
  exit 1
fi

setup_git_push() {
  export GIT_CONFIG_GLOBAL="${GIT_CONFIG_GLOBAL:-/dev/null}"
  export GIT_CONFIG_SYSTEM="${GIT_CONFIG_SYSTEM:-/dev/null}"

  if [ -n "${ADALA_AI_SSH_KEY:-}" ]; then
    KEY_FILE="$(mktemp)"
    trap 'rm -f "$KEY_FILE"' EXIT
    printf '%s\n' "$ADALA_AI_SSH_KEY" > "$KEY_FILE"
    chmod 600 "$KEY_FILE"
    export GIT_SSH_COMMAND="ssh -i ${KEY_FILE} -o StrictHostKeyChecking=no -o IdentitiesOnly=yes"
    TARGET_REPO="git@github.com:eadala/adala-ai.git"
    echo "Using SSH deploy key"
  elif [ -n "${ADALA_AI_SYNC_TOKEN:-}" ]; then
    TARGET_REPO="https://x-access-token:${ADALA_AI_SYNC_TOKEN}@github.com/eadala/adala-ai.git"
    echo "Using HTTPS token"
  elif [[ "${TARGET_REPO}" == git@* ]]; then
    echo "Using SSH (agent/default key)"
  fi
}

setup_git_push

if git remote get-url "${REMOTE_NAME}" >/dev/null 2>&1; then
  git remote set-url "${REMOTE_NAME}" "${TARGET_REPO}"
else
  git remote add "${REMOTE_NAME}" "${TARGET_REPO}"
fi

echo "Fetching target..."
git fetch "${REMOTE_NAME}"

if git rev-parse "${REMOTE_NAME}/main" >/dev/null 2>&1; then
  if ! git rev-parse "${LEGACY_TAG}" >/dev/null 2>&1; then
    echo "Tagging legacy Replit stack as ${LEGACY_TAG}..."
    git tag -a "${LEGACY_TAG}" -m "Legacy Replit + Clerk + Vite before Engineering OS cutover" "${REMOTE_NAME}/main"
    git push "${REMOTE_NAME}" "${LEGACY_TAG}"
  else
    echo "Tag ${LEGACY_TAG} already exists locally — skipping tag creation"
  fi
else
  echo "WARN: ${REMOTE_NAME}/main not found; skipping legacy tag"
fi

echo ""
echo "Pushing ${SOURCE_BRANCH} → adala-ai/main (force)..."
git push "${REMOTE_NAME}" "${SOURCE_BRANCH}:main" --force

echo ""
echo "Done. Canonical repo: git@github.com:eadala/adala-ai.git"
echo "Next: ./scripts/cutover-adalahai.sh on VPS (see .docs/MIGRATION-adala-ai-cutover.md)"
