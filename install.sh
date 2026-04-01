#!/bin/bash
set -e

# Buddy Evolution Plugin Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/yazelin/buddy-evolution/master/install.sh | bash

INSTALL_DIR="$HOME/.buddy-evolution-plugin"
REPO_URL="https://github.com/yazelin/buddy-evolution.git"
SETTINGS_FILE="$HOME/.claude/settings.json"

echo "🫧 Installing Buddy Evolution Plugin..."
echo ""

# Check dependencies
for cmd in git node npm; do
  if ! command -v $cmd &>/dev/null; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

# Check for pnpm
if ! command -v pnpm &>/dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

# Clone or update repo
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation..."
  cd "$INSTALL_DIR"
  git pull --ff-only
else
  echo "Cloning repository..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Install dependencies and build
echo "Building..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm --filter @buddy-evolution/core build
pnpm --filter @buddy-evolution/plugin build

PLUGIN_DIR="$INSTALL_DIR/packages/plugin"

# Add to Claude Code settings
if [ -f "$SETTINGS_FILE" ]; then
  # Check if already added
  if grep -q "buddy-evolution" "$SETTINGS_FILE" 2>/dev/null; then
    echo "Plugin already registered in Claude Code settings."
  else
    # Add pluginDirs using node for safe JSON manipulation
    node -e "
      const fs = require('fs');
      const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf-8'));
      if (!settings.pluginDirs) settings.pluginDirs = [];
      if (!settings.pluginDirs.includes('$PLUGIN_DIR')) {
        settings.pluginDirs.push('$PLUGIN_DIR');
      }
      fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2) + '\n');
    "
    echo "Registered plugin in Claude Code settings."
  fi
else
  echo "Warning: Claude Code settings not found at $SETTINGS_FILE"
  echo "Add this to your settings.json manually:"
  echo "  \"pluginDirs\": [\"$PLUGIN_DIR\"]"
fi

# Create data directory
mkdir -p "$HOME/.buddy-evolution"

echo ""
echo "✅ Buddy Evolution Plugin installed!"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code"
echo "  2. Run /buddy-evolution:evo setup    — import your /buddy data"
echo "  3. Run /buddy-evolution:evo          — see your buddy's evolution"
echo ""
echo "To sync to the platform:"
echo "  1. Visit https://buddy-evolution-web.vercel.app/login"
echo "  2. Sign in with GitHub and generate a token"
echo "  3. Copy the config to ~/.buddy-evolution/sync-config.json"
echo "  4. Run /buddy-evolution:evo sync"
echo ""
echo "🫧 Happy evolving!"
