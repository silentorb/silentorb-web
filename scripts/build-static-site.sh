#!/usr/bin/env bash
set -euo pipefail

SILENTORB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export TOME_CONTENT_PATH="${TOME_CONTENT_PATH:-${SILENTORB_ROOT}/content}"
export TOME_DB_PATH="${TOME_DB_PATH:-${SILENTORB_ROOT}/data/tome.sqlite}"
export TOME_WEB_PUBLIC_DIR="${TOME_WEB_PUBLIC_DIR:-${SILENTORB_ROOT}/public}"

WORKBENCH_ROOT="$(cd "${SILENTORB_ROOT}/../.." && pwd)"
TOME_ROOT="${TOME_ROOT:-${WORKBENCH_ROOT}/repos/tome}"

if [[ ! -d "${TOME_ROOT}/packages/tome-static-site" ]]; then
  TOME_ROOT="${TOME_ROOT:-${SILENTORB_ROOT}/tome}"
fi

if [[ ! -d "${TOME_ROOT}/packages/tome-static-site" ]]; then
  echo "tome repo not found. Clone silentorb/tome to ${TOME_ROOT} or build from silentorb-workbench." >&2
  exit 1
fi

cd "$TOME_ROOT"
# shellcheck source=ensure-node-modules.sh
source "${TOME_ROOT}/scripts/ensure-node-modules.sh"

exec bun run web:build -- \
  --repo "$SILENTORB_ROOT" \
  --content-dir "$TOME_CONTENT_PATH" \
  --db-path "$TOME_DB_PATH" \
  --out-dir "${SILENTORB_ROOT}/dist" \
  --public-dir "$TOME_WEB_PUBLIC_DIR"
