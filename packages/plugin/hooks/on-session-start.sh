#!/bin/bash
set -euo pipefail

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.buddy-evolution}"
mkdir -p "$DATA_DIR"

# Create session file with start time
cat > "$DATA_DIR/current-session.json" << EOF
{"startTime":$(date +%s%3N),"toolCalls":0,"fileEdits":0,"testRuns":0,"rejectedToolCalls":0,"forceSnips":0,"contextResets":0}
EOF

exit 0
