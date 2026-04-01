#!/bin/bash
set -euo pipefail

# Buddy Evolution — register hooks into settings.json
# Claude Code plugin.json hooks are documented but broken (see #16288),
# so we write directly to settings.json as a workaround.

SETTINGS_FILE="$HOME/.claude/settings.json"
PLUGIN_CACHE_DIR="$HOME/.claude/plugins/cache/buddy-evolution"

if [ ! -f "$SETTINGS_FILE" ]; then
  exit 0
fi

# Find the actual plugin root (latest cached version)
PLUGIN_ROOT=""
if [ -d "$PLUGIN_CACHE_DIR" ]; then
  # Get the latest version directory
  LATEST=$(ls -d "$PLUGIN_CACHE_DIR"/buddy-evolution/*/ 2>/dev/null | sort -V | tail -1)
  if [ -n "$LATEST" ]; then
    PLUGIN_ROOT="${LATEST%/}"
  fi
fi

if [ -z "$PLUGIN_ROOT" ]; then
  echo "⚠ Could not find buddy-evolution plugin cache directory"
  exit 0
fi

node -e "
const fs = require('fs');
const path = '${SETTINGS_FILE}';
const pluginRoot = '${PLUGIN_ROOT}';
const settings = JSON.parse(fs.readFileSync(path, 'utf8'));

if (!settings.hooks) settings.hooks = {};

// Helper: check if buddy-evolution hook already exists in an event
function hasBuddyHook(event) {
  if (!settings.hooks[event]) return false;
  return settings.hooks[event].some(entry =>
    entry.hooks && entry.hooks.some(h => h.command && h.command.includes('buddy-evolution'))
  );
}

const hooksToRegister = {
  SessionStart: {
    hooks: [
      {
        type: 'command',
        command: 'bash \"' + pluginRoot + '/hooks/on-session-start.sh\"',
        timeout: 5
      }
    ]
  },
  PostToolUse: {
    matcher: 'Bash|Edit|Write|NotebookEdit',
    hooks: [
      {
        type: 'command',
        command: 'bash \"' + pluginRoot + '/hooks/on-tool-use.sh\"',
        timeout: 3,
        async: true
      }
    ]
  },
  PostToolUseFailure: {
    hooks: [
      {
        type: 'command',
        command: 'bash \"' + pluginRoot + '/hooks/on-tool-fail.sh\"',
        timeout: 3,
        async: true
      }
    ]
  },
  PostCompact: {
    hooks: [
      {
        type: 'command',
        command: 'bash \"' + pluginRoot + '/hooks/on-compact.sh\"',
        timeout: 3,
        async: true
      }
    ]
  },
  SessionEnd: {
    hooks: [
      {
        type: 'command',
        command: 'bash \"' + pluginRoot + '/hooks/on-session-end.sh\"',
        timeout: 30
      }
    ]
  }
};

let changed = false;
for (const [event, entry] of Object.entries(hooksToRegister)) {
  if (!hasBuddyHook(event)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];
    settings.hooks[event].push(entry);
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(path, JSON.stringify(settings, null, 2) + '\n');
  console.log('✓ Registered buddy-evolution hooks in settings.json');
} else {
  console.log('✓ Hooks already registered');
}
" 2>&1

exit 0
