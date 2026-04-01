#!/bin/bash
set -e

INSTALL_DIR="$HOME/.buddy-evolution-plugin"

echo "Uninstalling Buddy Evolution Plugin..."

# Remove shell alias
for RC_FILE in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if [ -f "$RC_FILE" ] && grep -q "buddy-evolution" "$RC_FILE" 2>/dev/null; then
    sed -i '/# Buddy Evolution Plugin/d' "$RC_FILE"
    sed -i '/buddy-evolution/d' "$RC_FILE"
    echo "Removed alias from $(basename $RC_FILE)"
  fi
done

# Remove plugin directory
if [ -d "$INSTALL_DIR" ]; then
  rm -rf "$INSTALL_DIR"
  echo "Removed $INSTALL_DIR"
fi

echo ""
echo "✅ Uninstalled. Run: source ~/.bashrc"
echo "   Your evolution data at ~/.buddy-evolution/ was kept."
echo "   To remove it too: rm -rf ~/.buddy-evolution/"
