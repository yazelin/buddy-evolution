#!/bin/bash
set -euo pipefail

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.buddy-evolution}"
SESSION_FILE="$DATA_DIR/current-session.json"

[ -f "$SESSION_FILE" ] || exit 0

# Read stdin for tool info
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.tool_name||'')}catch{}" 2>/dev/null || echo "")

# Read current state
STATE=$(cat "$SESSION_FILE")

# Increment toolCalls
TC=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.toolCalls+1)}catch{console.log(1)}" 2>/dev/null || echo "1")

# Check file edits
FE=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.fileEdits)}catch{console.log(0)}" 2>/dev/null || echo "0")
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" || "$TOOL_NAME" == "NotebookEdit" ]]; then
  FE=$((FE + 1))
fi

# Check test runs
TR=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.testRuns)}catch{console.log(0)}" 2>/dev/null || echo "0")
if [[ "$TOOL_NAME" == "Bash" ]]; then
  CMD=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.tool_input?.command||'')}catch{}" 2>/dev/null || echo "")
  if echo "$CMD" | grep -qiE '\btest\b|\bvitest\b|\bjest\b|\bpytest\b'; then
    TR=$((TR + 1))
  fi
fi

# Get other fields
ST=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.startTime)}catch{console.log(0)}" 2>/dev/null || echo "0")
RTC=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.rejectedToolCalls)}catch{console.log(0)}" 2>/dev/null || echo "0")
FS=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.forceSnips)}catch{console.log(0)}" 2>/dev/null || echo "0")
CR=$(echo "$STATE" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf-8'));console.log(d.contextResets)}catch{console.log(0)}" 2>/dev/null || echo "0")

cat > "$SESSION_FILE" << EOF
{"startTime":$ST,"toolCalls":$TC,"fileEdits":$FE,"testRuns":$TR,"rejectedToolCalls":$RTC,"forceSnips":$FS,"contextResets":$CR}
EOF

exit 0
