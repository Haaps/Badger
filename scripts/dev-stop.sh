#!/usr/bin/env bash
set -euo pipefail

DEV_PORT="${DEV_PORT:-5173}"

if lsof -tiTCP:"$DEV_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Stopping dev server on port $DEV_PORT ..."
  lsof -tiTCP:"$DEV_PORT" -sTCP:LISTEN | xargs kill 2>/dev/null || true
  sleep 0.5
fi
