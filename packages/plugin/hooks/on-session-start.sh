#!/bin/bash
set -euo pipefail

# --- Bootstrap: ensure @buddy-evolution/core is available ---
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-}"

# If CLAUDE_PLUGIN_ROOT is not set, try to find it from cache
if [ -z "$PLUGIN_ROOT" ]; then
  CACHE_DIR="$HOME/.claude/plugins/cache/buddy-evolution"
  if [ -d "$CACHE_DIR" ]; then
    LATEST=$(ls -d "$CACHE_DIR"/buddy-evolution/*/ 2>/dev/null | sort -V | tail -1)
    [ -n "$LATEST" ] && PLUGIN_ROOT="${LATEST%/}"
  fi
fi

if [ -n "$PLUGIN_ROOT" ] && [ -d "$PLUGIN_ROOT/vendor/core-dist" ]; then
  CORE_TARGET="$PLUGIN_ROOT/node_modules/@buddy-evolution/core"
  if [ ! -d "$CORE_TARGET" ]; then
    mkdir -p "$CORE_TARGET/dist"
    cp "$PLUGIN_ROOT/vendor/core-dist/"* "$CORE_TARGET/dist/"
    cp "$PLUGIN_ROOT/vendor/core-package.json" "$CORE_TARGET/package.json"
  fi
fi

# --- Bootstrap: ensure hooks are registered in settings.json ---
SETTINGS_FILE="$HOME/.claude/settings.json"
if [ -n "$PLUGIN_ROOT" ] && [ -f "$SETTINGS_FILE" ]; then
  # Check if hooks point to current PLUGIN_ROOT
  if ! grep -q "$PLUGIN_ROOT/hooks/on-session-start.sh" "$SETTINGS_FILE" 2>/dev/null; then
    node -e "
const fs = require('fs');
const pluginRoot = '$PLUGIN_ROOT';
const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf8'));
if (!settings.hooks) settings.hooks = {};

// Remove stale buddy-evolution hooks
for (const [event, entries] of Object.entries(settings.hooks)) {
  settings.hooks[event] = entries.filter(e =>
    !e.hooks || !e.hooks.some(h => h.command && h.command.includes('buddy-evolution'))
  );
  if (settings.hooks[event].length === 0) delete settings.hooks[event];
}

// Add fresh hooks
const hooks = {
  SessionStart: { hooks: [{ type: 'command', command: 'bash \"' + pluginRoot + '/hooks/on-session-start.sh\"', timeout: 5 }] },
  PostToolUse: { matcher: 'Bash|Edit|Write|NotebookEdit', hooks: [{ type: 'command', command: 'bash \"' + pluginRoot + '/hooks/on-tool-use.sh\"', timeout: 3, async: true }] },
  PostToolUseFailure: { hooks: [{ type: 'command', command: 'bash \"' + pluginRoot + '/hooks/on-tool-fail.sh\"', timeout: 3, async: true }] },
  PostCompact: { hooks: [{ type: 'command', command: 'bash \"' + pluginRoot + '/hooks/on-compact.sh\"', timeout: 3, async: true }] },
  SessionEnd: { hooks: [{ type: 'command', command: 'bash \"' + pluginRoot + '/hooks/on-session-end.sh\"', timeout: 30 }] }
};
for (const [event, entry] of Object.entries(hooks)) {
  if (!settings.hooks[event]) settings.hooks[event] = [];
  settings.hooks[event].push(entry);
}
fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
" 2>/dev/null
  fi
fi

# --- Original session tracking ---
DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.buddy-evolution}"
mkdir -p "$DATA_DIR"

# Create session file with start time
cat > "$DATA_DIR/current-session.json" << EOF
{"startTime":$(date +%s%3N),"toolCalls":0,"fileEdits":0,"testRuns":0,"rejectedToolCalls":0,"forceSnips":0,"contextResets":0}
EOF

exit 0
