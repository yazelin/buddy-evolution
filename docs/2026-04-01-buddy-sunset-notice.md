# /buddy Official Sunset Notice

## Summary

On April 1, 2026, Anthropic team member **@alii** confirmed that `/buddy` is an April Fools feature and **will be removed in a few days**.

> "The TLDR is since this is just a feature for April fools that will be removed in a few days, it's unlikely we'll be developing this further."

- **Source**: [#41684 comment](https://github.com/anthropics/claude-code/issues/41684#issuecomment-4172557121)
- **Cross-reference**: [#41867 comment](https://github.com/anthropics/claude-code/issues/41867#issuecomment-4172543771)

## Impact on This Project

This plugin currently depends on `/buddy` for:

1. **`/evo setup`** — imports species, rarity, stats, and name from the official `/buddy` soul file
2. **Sprite rendering** — the evolution overlay system composites on top of `/buddy`'s base ASCII art

Once `/buddy` is removed, these features will break.

## Alternatives

**[FrankFMY/buddy-evolution](https://github.com/FrankFMY/buddy-evolution)** is a standalone companion progression plugin that does **not** depend on the official `/buddy` command. It generates its own species/rarity/personality, runs on pure Node.js with zero dependencies, and keeps all data local. If you're looking for a buddy progression system that works after the official `/buddy` is removed, consider using that instead.
