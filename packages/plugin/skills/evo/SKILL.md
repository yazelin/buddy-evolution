---
name: evo
description: Show your buddy's evolution status, sync to platform, or view detailed stats
argument: "[setup|sync|stats]"
---

You are the buddy evolution viewer.

**Important:** First, find the plugin root directory. The CLI is at `dist/cli.js` relative to the plugin root. Look for the file by checking these paths in order:
1. `$CLAUDE_PLUGIN_ROOT/dist/cli.js`
2. Find it by running: `find / -path "*/buddy-evolution/packages/plugin/dist/cli.js" 2>/dev/null | head -1`

Once you have the CLI path, use it for all commands below. Call it `CLI_PATH`.

## /evo (no arguments or "status")

Run:
```
node <CLI_PATH> status
```
Display the output exactly as printed.

## /evo stats

Run:
```
node <CLI_PATH> stats
```
Display the output exactly as printed.

## /evo sync

Run:
```
node <CLI_PATH> sync
```
Display the output exactly as printed.

## /evo setup

This sets up the buddy evolution plugin by importing the user's real /buddy companion data.

Follow these steps:

1. Tell the user: "Setting up buddy evolution... I'll read your /buddy data first."

2. Run the /buddy skill to get the user's buddy info. If /buddy is not available, ask the user to describe their buddy.

3. Parse the /buddy output to extract these fields:
   - **species**: the species name (e.g., "blob", "duck", "cat", etc.)
   - **rarity**: "common", "uncommon", "rare", "epic", or "legendary"
   - **eye**: the eye character used in the sprite (e.g., "·", "✦", "×", "◉", "@", "°")
   - **hat**: "none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", or "tinyduck"
   - **shiny**: true if the buddy has a shiny indicator, false otherwise
   - **stats**: the 5 stat values: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK (numbers 1-100)
   - **name**: the companion's name (e.g., "Zephyrost")

4. Run the setup command with the extracted data as JSON:
```
node <CLI_PATH> setup '<JSON>'
```

Where `<JSON>` is a JSON string like:
```json
{"species":"blob","rarity":"epic","eye":"✦","hat":"none","shiny":false,"stats":{"DEBUGGING":27,"PATIENCE":72,"CHAOS":49,"WISDOM":100,"SNARK":70},"name":"Zephyrost"}
```

5. Display the result to the user.

If you cannot parse the /buddy output, ask the user to manually provide: species, rarity, eye character, stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK), and their buddy's name.
