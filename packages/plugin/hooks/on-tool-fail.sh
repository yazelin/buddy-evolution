#!/bin/bash
set -euo pipefail

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.buddy-evolution}"
SESSION_FILE="$DATA_DIR/current-session.json"

[ -f "$SESSION_FILE" ] || exit 0

STATE=$(cat "$SESSION_FILE")
RTC=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.rejectedToolCalls+1)}catch{console.log(1)}" 2>/dev/null || echo "1")
NEW=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));d.rejectedToolCalls=$RTC;console.log(JSON.stringify(d))}catch{}" 2>/dev/null || echo "$STATE")
echo "$NEW" > "$SESSION_FILE"

exit 0
