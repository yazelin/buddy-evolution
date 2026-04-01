#!/bin/bash
set -e

INSTALL_DIR="$HOME/.buddy-evolution-plugin"
SETTINGS_FILE="$HOME/.claude/settings.json"

echo "Uninstalling Buddy Evolution Plugin..."

# Remove from Claude Code settings
if [ -f "$SETTINGS_FILE" ]; then
  node -e "
    const fs = require('fs');
    const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf-8'));
    if (settings.pluginDirs) {
      settings.pluginDirs = settings.pluginDirs.filter(d => !d.includes('buddy-evolution'));
      if (settings.pluginDirs.length === 0) delete settings.pluginDirs;
    }
    fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
  "
  echo "Removed from Claude Code settings."
fi

# Remove plugin directory
if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR"
  echo "Removed $INSTALL_DIR"
fi

echo ""
echo "✅ Uninstalled. Your evolution data at ~/.buddy-evolution/ was kept."
echo "   To remove it too: rm -rf ~/.buddy-evolution/"
