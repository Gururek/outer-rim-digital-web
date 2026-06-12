#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# ── Detect LAN IP ────────────────────────────────────────────────────────────
IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
IP=${IP:-localhost}

# ── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║    STAR WARS: OUTER RIM DIGITAL      ║"
echo "  ╚══════════════════════════════════════╝"
echo ""
echo "  Game server  → ws://$IP:2567"
echo "  Client       → http://$IP:5173"
echo ""
echo "  Share the client URL with players on your LAN."
echo "  Press Ctrl+C to stop everything."
echo ""

# ── Build + start server (tsc for decorator support; tsx/esbuild breaks them) ──
packages/server/node_modules/.bin/tsc -p packages/server/tsconfig.json
node packages/server/dist/index.js &
SERVER_PID=$!

# ── Start client ─────────────────────────────────────────────────────────────
(cd packages/client && node_modules/.bin/vite --host) &
CLIENT_PID=$!

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "  Shutting down..."
  kill "$SERVER_PID" "$CLIENT_PID" 2>/dev/null
  wait "$SERVER_PID" "$CLIENT_PID" 2>/dev/null
}
trap cleanup EXIT INT TERM

wait
