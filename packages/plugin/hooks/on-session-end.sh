#!/bin/bash
node "$CLAUDE_PLUGIN_ROOT/dist/hooks/on-session-end.js" 2>/dev/null
exit 0
