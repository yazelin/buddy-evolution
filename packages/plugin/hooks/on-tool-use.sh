#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-tool-use.js" 2>/dev/null
exit 0
