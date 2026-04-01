#!/bin/bash
set -e

INSTALL_DIR="$HOME/.buddy-evolution-plugin"

echo "Uninstalling Buddy Evolution Plugin..."

# Remove plugin directory
if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR"
  echo "Removed $INSTALL_DIR"
fi

echo ""
echo "✅ Uninstalled."
echo "   Your evolution data at ~/.buddy-evolution/ was kept."
echo "   To remove it too: rm -rf ~/.buddy-evolution/"
