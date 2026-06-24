#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Named Docker volumes mount as root:root; yarn install runs as node.
if [[ ! -d node_modules ]] || [[ ! -w node_modules ]]; then
  sudo mkdir -p node_modules
  sudo chown "$(id -u):$(id -g)" node_modules
fi

yarn install --frozen-lockfile
exec sleep infinity
