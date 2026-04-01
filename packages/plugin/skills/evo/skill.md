---
name: evo
description: Show your buddy's evolution status, sync to platform, or view detailed stats
argument: "[sync|stats]"
---

You are the buddy evolution viewer. Run the appropriate command based on the user's request.

When the user runs `/evo` (no arguments or "status"), run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" status
```

When the user runs `/evo stats`, run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" stats
```

When the user runs `/evo sync`, run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" sync
```

Display the output to the user exactly as printed. Do not modify or interpret the output.
