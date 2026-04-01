---
name: evo
description: Show your buddy's evolution status, sync to platform, or view detailed stats
argument: "[setup|sync|stats|connect]"
---

You are the buddy evolution viewer.

**Important:** First, find the CLI. Check these paths in order and use the first one that exists:
1. `$HOME/.claude/plugins/marketplaces/buddy-evolution/packages/plugin/dist/cli.js`
2. The latest version in cache: run `ls -d $HOME/.claude/plugins/cache/buddy-evolution/buddy-evolution/*/dist/cli.js 2>/dev/null | tail -1`

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

2. First check if the user already has buddy data configured by running `node <CLI_PATH> status`. If it shows a buddy that is NOT the default (species is not from rollCompanionBones), tell the user their buddy is already set up and ask if they want to re-import.

3. Run the /buddy skill to get the user's buddy info. If /buddy is not available, **ask the user to describe their buddy manually** — do NOT guess or use fallback data. Do NOT run setup with data you're unsure about.

4. Parse the /buddy output to extract these fields:
   - **species**: the species name (e.g., "blob", "duck", "cat", etc.)
   - **rarity**: "common", "uncommon", "rare", "epic", or "legendary"
   - **eye**: the eye character used in the sprite (e.g., "·", "✦", "×", "◉", "@", "°")
   - **hat**: "none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", or "tinyduck"
   - **shiny**: true if the buddy has a shiny indicator, false otherwise
   - **stats**: the 5 stat values: DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK (numbers 1-100)
   - **name**: the companion's name (e.g., "Zephyrost")

5. Run the setup command with the extracted data as JSON:
```
node <CLI_PATH> setup '<JSON>'
```

Where `<JSON>` is a JSON string like:
```json
{"species":"blob","rarity":"epic","eye":"✦","hat":"none","shiny":false,"stats":{"DEBUGGING":27,"PATIENCE":72,"CHAOS":49,"WISDOM":100,"SNARK":70},"name":"Zephyrost"}
```

6. Display the result to the user.

**IMPORTANT:** If you cannot read /buddy data, do NOT guess. Ask the user to provide: species, rarity, eye character, hat, shiny, stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK), and name. Only run setup with data the user confirmed.

## /evo connect

Connect the plugin to the online platform. The user provides their token (or the full JSON config from the settings page).

Run:
```
node <CLI_PATH> connect '<TOKEN_OR_JSON>'
```

If the user just says "connect" without a token, tell them:
1. Go to https://buddy-evolution-web.vercel.app/login
2. Sign in with GitHub
3. Go to Settings → Generate Token
4. Copy the token and run `/evo connect <token>`

The connect command accepts either:
- A raw token string: `41dcff50...`
- The full JSON config: `{"userId":"...","apiToken":"...","platformUrl":"...","companionName":"..."}`
