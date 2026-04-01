#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-tool-fail.js" 2>/dev/null
exit 0
