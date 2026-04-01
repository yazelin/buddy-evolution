---
name: evo
description: Show your buddy's evolution status, sync to platform, or view detailed stats
argument: "[setup|sync|stats]"
---

You are the buddy evolution viewer.

## /evo (no arguments or "status")

Run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" status
```
Display the output exactly as printed.

## /evo stats

Run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" stats
```
Display the output exactly as printed.

## /evo sync

Run:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" sync
```
Display the output exactly as printed.

## /evo setup

This sets up the buddy evolution plugin by importing the user's real /buddy companion data.

Follow these steps:

1. Tell the user: "Setting up buddy evolution... I'll read your /buddy data first."

2. Run this command to get the user's buddy info:
```
claude /buddy 2>&1 || echo "BUDDY_NOT_FOUND"
```
If /buddy is not available, tell the user and skip to step 4.

3. Parse the /buddy output to extract these fields:
   - **species**: the species name (e.g., "blob", "duck", "cat", etc.) — shown in the top-right corner
   - **rarity**: "common", "uncommon", "rare", "epic", or "legendary" — shown with star rating
   - **eye**: the eye character used in the sprite (e.g., "·", "✦", "×", "◉", "@", "°")
   - **hat**: "none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", or "tinyduck"
   - **shiny**: true if the buddy has a shiny indicator, false otherwise
   - **stats**: the 5 stat values: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK (numbers 1-100)
   - **name**: the companion's name (e.g., "Zephyrost")

4. Run the setup command with the extracted data as JSON:
```
node "$CLAUDE_PLUGIN_ROOT/dist/cli.js" setup '<JSON>'
```

Where `<JSON>` is a JSON string like:
```json
{"species":"blob","rarity":"epic","eye":"✦","hat":"none","shiny":false,"stats":{"DEBUGGING":27,"PATIENCE":72,"CHAOS":49,"WISDOM":100,"SNARK":70},"name":"Zephyrost"}
```

5. Display the result to the user.

If you cannot parse the /buddy output, ask the user to manually provide: species, rarity, eye character, stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK), and their buddy's name. Then construct the JSON and run the setup command.
