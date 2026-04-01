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

# Create data directory
mkdir -p "$HOME/.buddy-evolution"

echo ""
echo "✅ Buddy Evolution Plugin installed at $PLUGIN_DIR"
echo ""
echo "To use it, start Claude Code with:"
echo ""
echo "  claude --plugin-dir $PLUGIN_DIR"
echo ""
echo "Then in Claude Code:"
echo "  /buddy-evolution:evo setup    — import your /buddy data"
echo "  /buddy-evolution:evo          — see your buddy's evolution"
echo "  /buddy-evolution:evo sync     — sync to the platform"
echo ""
echo "Platform: https://buddy-evolution-web.vercel.app"
echo ""
echo "🫧 Happy evolving!"
