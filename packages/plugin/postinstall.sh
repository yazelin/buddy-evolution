#!/bin/bash
set -euo pipefail

# Buddy Evolution — register hooks into Claude Code settings.json
# This runs after plugin install to ensure hooks are active.

SETTINGS_FILE="$HOME/.claude/settings.json"
PLUGIN_CACHE_DIR="$HOME/.claude/plugins/cache/buddy-evolution"

# Find the installed plugin root (latest version in cache)
PLUGIN_ROOT=$(ls -d "$PLUGIN_CACHE_DIR"/buddy-evolution/*/ 2>/dev/null | tail -1)
if [ -z "$PLUGIN_ROOT" ]; then
  echo "⚠ Could not find buddy-evolution cache directory, skipping hook registration"
  exit 0
fi

# Normalize: remove trailing slash
PLUGIN_ROOT="${PLUGIN_ROOT%/}"

if [ ! -f "$SETTINGS_FILE" ]; then
  echo "⚠ $SETTINGS_FILE not found, skipping hook registration"
  exit 0
fi

# Check if buddy-evolution hooks are already registered
if grep -q "buddy-evolution" "$SETTINGS_FILE" 2>/dev/null; then
  if grep -q "on-session-start.sh" "$SETTINGS_FILE" 2>/dev/null; then
    echo "✓ Buddy Evolution hooks already registered"
    exit 0
  fi
fi

# Use node to safely merge hooks into settings.json
node -e "
const fs = require('fs');
const path = '${SETTINGS_FILE}';
const pluginRoot = '${PLUGIN_ROOT}';

const settings = JSON.parse(fs.readFileSync(path, 'utf8'));
if (!settings.hooks) settings.hooks = {};

const evoHook = (script, timeout, async) => ({
  type: 'command',
  command: 'bash \"' + pluginRoot + '/hooks/' + script + '\"',
  timeout: timeout || 5,
  ...(async ? { async: true } : {})
});

const evoEntry = (matcher, script, timeout, async) => ({
  ...(matcher ? { matcher } : {}),
  hooks: [evoHook(script, timeout, async)]
});

// Helper: append to hook array without duplicating
function addHook(event, entry) {
  if (!settings.hooks[event]) settings.hooks[event] = [];
  // Skip if already has buddy-evolution hook
  const exists = settings.hooks[event].some(e =>
    e.hooks && e.hooks.some(h => h.command && h.command.includes('buddy-evolution'))
  );
  if (!exists) settings.hooks[event].push(entry);
}

addHook('SessionStart', evoEntry(null, 'on-session-start.sh', 5, false));
addHook('PostToolUse', evoEntry('Bash|Edit|Write|NotebookEdit', 'on-tool-use.sh', 3, true));
addHook('PostToolUseFailure', evoEntry(null, 'on-tool-fail.sh', 3, true));
addHook('PostCompact', evoEntry(null, 'on-compact.sh', 3, true));
addHook('SessionEnd', evoEntry(null, 'on-session-end.sh', 30, false));

fs.writeFileSync(path, JSON.stringify(settings, null, 2) + '\n');
console.log('✓ Buddy Evolution hooks registered in settings.json');
" 2>&1

exit 0
