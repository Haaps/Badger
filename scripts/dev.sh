#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NODE="${CURSOR_NODE:-/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node}"
NPM_CLI="$ROOT/.tools/package/bin/npm-cli.js"
export PATH="$(dirname "$NODE"):$PATH"

if [ ! -x "$NODE" ] && command -v node >/dev/null 2>&1; then
  NODE="$(command -v node)"
fi

if [ ! -f "$NPM_CLI" ]; then
  echo "Bootstrapping npm into .tools/ ..."
  mkdir -p "$ROOT/.tools"
  TMP="$ROOT/.tools/npm.tgz"
  curl -fsSL "https://registry.npmjs.org/npm/-/npm-10.9.2.tgz" -o "$TMP"
  tar -xzf "$TMP" -C "$ROOT/.tools"
  rm "$TMP"
fi

run_npm() {
  "$NODE" "$NPM_CLI" --prefix "$ROOT" "$@"
}

cd "$ROOT"

if [ ! -d node_modules ]; then
  echo "Installing dependencies ..."
  run_npm install
fi

bash "$ROOT/scripts/dev-stop.sh"

echo ""
echo "Starting dev server at http://localhost:${DEV_PORT:-5173}/"
echo ""

run_npm run dev
