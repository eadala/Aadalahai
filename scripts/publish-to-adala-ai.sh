#!/usr/bin/env bash
# One-time (or repeatable) sync: Engineering OS main → eadala/adala-ai
# Requires admin/write access to eadala/adala-ai
set -euo pipefail

TARGET_REPO="${TARGET_REPO:-https://github.com/eadala/adala-ai.git}"
LEGACY_TAG="${LEGACY_TAG:-legacy-replit-pre-cutover}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main}"

echo "=== Publish to eadala/adala-ai (same repo, same name) ==="
echo "Source branch: ${SOURCE_BRANCH}"
echo "Target:        ${TARGET_REPO}"
echo ""

if ! git rev-parse --verify "${SOURCE_BRANCH}" >/dev/null 2>&1; then
  echo "ERROR: branch ${SOURCE_BRANCH} not found" >&2
  exit 1
fi

if ! git remote get-url adala-ai >/dev/null 2>&1; then
  git remote add adala-ai "${TARGET_REPO}"
fi

echo "Fetching target..."
git fetch adala-ai

if git rev-parse "adala-ai/main" >/dev/null 2>&1; then
  if ! git rev-parse "${LEGACY_TAG}" >/dev/null 2>&1; then
    echo "Tagging legacy Replit stack as ${LEGACY_TAG}..."
    git tag -a "${LEGACY_TAG}" -m "Legacy Replit + Clerk + Vite before Engineering OS cutover" adala-ai/main
    git push adala-ai "${LEGACY_TAG}"
  else
    echo "Tag ${LEGACY_TAG} already exists locally — skipping tag creation"
  fi
else
  echo "WARN: adala-ai/main not found; skipping legacy tag"
fi

echo ""
echo "Pushing ${SOURCE_BRANCH} → adala-ai/main (force)..."
git push adala-ai "${SOURCE_BRANCH}:main" --force

echo ""
echo "Done. Canonical repo: eadala/adala-ai"
echo "Next: ./scripts/cutover-adalahai.sh on VPS (see .docs/MIGRATION-adala-ai-cutover.md)"
