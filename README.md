# Buddy Evolution

RPG evolution system for Claude Code's `/buddy` companion pet. Your pet grows based on actual usage — not RNG, not time gates, just how much you use Claude Code.

```
                            🫧 Zephyrost the Blob
   .----.                   ══════════════════════
  ( ✦  ✦ )                  Tier: Juvenile ⚡
  (      )                  XP: 245,000 / 1,000,000
   `----´                   ████████░░░░░░░░ 24.5%

  DEBUGGING  ████████████████████░░░░ 68 (+23)
  PATIENCE   ███████████████░░░░░░░░░ 53 (+18)
  WISDOM     ██████████████░░░░░░░░░░ 44 (+9)
  SNARK      ██████░░░░░░░░░░░░░░░░░░ 19 (+4)
  CHAOS      █████░░░░░░░░░░░░░░░░░░░ 12 (+2)
```

## Install

One command:

```bash
curl -fsSL https://raw.githubusercontent.com/yazelin/buddy-evolution/master/install.sh | bash
```

Then restart Claude Code. That's it.

### Requirements

- Claude Code v2.1+
- Node.js 20+
- pnpm (auto-installed if missing)

### Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/yazelin/buddy-evolution/master/uninstall.sh | bash
```

## Usage

### Commands

| Command | What it does |
|---------|-------------|
| `/buddy-evolution:evo` | Show your buddy's evolution status |
| `/buddy-evolution:evo setup` | Import your real `/buddy` data |
| `/buddy-evolution:evo stats` | Detailed lifetime statistics |
| `/buddy-evolution:evo sync` | Sync to the online platform |

### Quick Start

```
1. /buddy-evolution:evo setup     ← imports your /buddy species, stats, name
2. /buddy-evolution:evo           ← see your buddy + XP progress
3. Use Claude Code normally        ← hooks track everything automatically
4. /buddy-evolution:evo           ← watch your XP grow!
```

## How It Works

### Automatic Tracking

The plugin installs hooks that track your Claude Code usage in real-time:

| Hook | What it tracks |
|------|---------------|
| `SessionStart` | Session start time |
| `PostToolUse` | Tool calls, file edits, test runs |
| `PostToolUseFailure` | Rejected tool calls |
| `PostCompact` | Context resets |
| `SessionEnd` | Parses transcript for token counts, calculates XP |

All tracking happens locally. Nothing is sent anywhere unless you explicitly `/evo sync`.

### XP Sources

| Source | Rate |
|--------|------|
| Output tokens | 1 XP per token |
| Input tokens | 0.5 XP per token |
| Tool calls | 100 XP each |
| 30+ min session | 5,000 bonus XP |
| Streak multiplier | 1.0x → 2.0x (caps at day 11) |

### Evolution Tiers

| Tier | XP Required | Visual Effect |
|------|------------|---------------|
| Hatchling | 0 | Base sprite |
| Juvenile | 100K | Corner energy markers |
| Adult | 1M | Species-specific pattern |
| Elder | 10M | Glowing aura border |
| Ascended | 100M | Floating star particles |

### Usage-Driven Stats

Stats grow based on how you actually use Claude Code:

| Stat | Driven By |
|------|-----------|
| DEBUGGING | File edits + test runs |
| WISDOM | Cumulative input tokens |
| CHAOS | Rejected tool call ratio |
| PATIENCE | Session duration |
| SNARK | Context resets + force snips |

Growth uses diminishing returns — fast early gains, asymptotic near the soft cap.

## Online Platform

Sync your buddy to the web platform for leaderboards, profiles, and achievements.

**Platform:** https://buddy-evolution-web.vercel.app

### Setup Sync

1. Visit https://buddy-evolution-web.vercel.app/login
2. Sign in with GitHub
3. Go to Settings → Generate Token
4. Copy the config JSON to `~/.buddy-evolution/sync-config.json`
5. Run `/buddy-evolution:evo sync`

### Features

- **Leaderboard** — Global XP ranking
- **Profile page** — Stat radar chart, XP progress, lifetime stats
- **Compare** — Side-by-side buddy comparison (`/compare?a=user1&b=user2`)
- **Achievements** — 12 achievements across milestones, streaks, usage, and rare categories

### Achievements

| Achievement | Condition |
|------------|-----------|
| First Steps | Complete first session |
| Growing Up | Reach Juvenile tier |
| Coming of Age | Reach Adult tier |
| Ancient Power | Reach Elder tier |
| Transcendence | Reach Ascended tier |
| Week Warrior | 7-day streak |
| Monthly Devotion | 30-day streak |
| Tool Master | 1,000 tool calls |
| Bug Hunter | DEBUGGING stat reaches 100 |
| Lucky Star | Own a shiny buddy |
| One in a Hundred | Legendary rarity |
| Token Millionaire | 1M output tokens |

## Architecture

Monorepo with 3 packages:

```
buddy-evolution/
├── packages/core/       # Shared evolution engine (types, XP, stats, sprites)
├── packages/plugin/     # Claude Code plugin (hooks, CLI, /evo skill)
└── packages/web/        # Next.js platform (Supabase + Vercel)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Core engine | TypeScript |
| Plugin | Claude Code hooks + skills |
| Platform | Next.js 15 + Tailwind CSS |
| Database | Supabase (Postgres) |
| Auth | GitHub OAuth via Supabase |
| Hosting | Vercel (free tier) |
| Monorepo | pnpm workspaces + Turborepo |

### Data Storage

All evolution data is stored locally at `~/.buddy-evolution/`:

```
~/.buddy-evolution/
├── evolution-state.json    # XP, tier, stats, streak
├── current-session.json    # Active session metrics (temp)
└── sync-config.json        # Platform auth token + buddy config
```

## Development

```bash
git clone https://github.com/yazelin/buddy-evolution.git
cd buddy-evolution
pnpm install
pnpm build
pnpm test          # 90 tests across core + plugin
```

### Run tests

```bash
pnpm --filter @buddy-evolution/core test    # 58 tests
pnpm --filter @buddy-evolution/plugin test  # 32 tests
```

### Local dev (web platform)

```bash
cp packages/web/.env.local.example packages/web/.env.local
# Fill in Supabase credentials
pnpm --filter @buddy-evolution/web dev
```

## Credits

Based on the evolution system design by [RaphaelRUzan/buddy-evolution](https://github.com/RaphaelRUzan/buddy-evolution) ([issue #41684](https://github.com/anthropics/claude-code/issues/41684)).

## License

MIT
