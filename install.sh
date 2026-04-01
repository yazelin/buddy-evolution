#!/bin/bash
set -e

# Buddy Evolution Plugin Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/yazelin/buddy-evolution/master/install.sh | bash

INSTALL_DIR="$HOME/.buddy-evolution-plugin"
REPO_URL="https://github.com/yazelin/buddy-evolution.git"
PLUGIN_DIR="$INSTALL_DIR/packages/plugin"

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

# Add shell alias so `claude` always loads the plugin
ALIAS_LINE="alias claude=\"claude --plugin-dir $PLUGIN_DIR\""
ALIAS_COMMENT="# Buddy Evolution Plugin for Claude Code"

for RC_FILE in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if [ -f "$RC_FILE" ]; then
    if ! grep -q "buddy-evolution" "$RC_FILE" 2>/dev/null; then
      echo "" >> "$RC_FILE"
      echo "$ALIAS_COMMENT" >> "$RC_FILE"
      echo "$ALIAS_LINE" >> "$RC_FILE"
      echo "Added alias to $(basename $RC_FILE)"
    else
      echo "Alias already exists in $(basename $RC_FILE)"
    fi
  fi
done

# Create data directory
mkdir -p "$HOME/.buddy-evolution"

echo ""
echo "✅ Buddy Evolution Plugin installed!"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.bashrc   (or restart your terminal)"
echo "  2. Run: claude"
echo "  3. In Claude Code:"
echo "     /buddy-evolution:evo setup    — import your /buddy data"
echo "     /buddy-evolution:evo          — see your buddy's evolution"
echo ""
echo "To sync to the platform:"
echo "  1. Visit https://buddy-evolution-web.vercel.app/login"
echo "  2. Sign in with GitHub and generate a token"
echo "  3. Copy the config to ~/.buddy-evolution/sync-config.json"
echo "  4. Run /buddy-evolution:evo sync"
echo ""
echo "🫧 Happy evolving!"
