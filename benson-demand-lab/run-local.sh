#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  exec node node_modules/vite/bin/vite.js --host 127.0.0.1 "$@"
fi
BENSON_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$BENSON_NODE" ]; then
  exec "$BENSON_NODE" node_modules/vite/bin/vite.js --host 127.0.0.1 "$@"
fi
printf '%s\n' 'Install Node.js 22.12+ and run pnpm install, then retry.' >&2
exit 1
