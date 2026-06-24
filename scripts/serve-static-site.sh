#!/usr/bin/env bash
set -euo pipefail

SILENTORB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${SILENTORB_WEB_PORT:-8080}"

if [[ ! -d "${SILENTORB_ROOT}/dist" ]]; then
  echo "Build output not found. Run: bash scripts/build-static-site.sh" >&2
  exit 1
fi

echo "Static site → http://127.0.0.1:${PORT}/"
exec python3 -m http.server "$PORT" --directory "${SILENTORB_ROOT}/dist"
