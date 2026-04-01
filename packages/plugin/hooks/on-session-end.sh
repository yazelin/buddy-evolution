#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
node "$PLUGIN_ROOT/dist/hooks/on-session-end.js" 2>/dev/null
exit 0
