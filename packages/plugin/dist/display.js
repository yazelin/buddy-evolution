import { STAT_NAMES, TIER_THRESHOLDS, EVOLUTION_TIERS, renderEvolvedSprite, getEffectiveStat, getStreakMultiplier, } from '@buddy-evolution/core';
export function formatXP(xp) {
    return xp.toLocaleString('en-US');
}
export function renderProgressBar(current, max, width) {
    const ratio = Math.min(1, Math.max(0, current / max));
    const filled = Math.round(ratio * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
}
export function renderStatBar(stat, base, growth) {
    const effective = getEffectiveStat(base, growth);
    const bar = renderProgressBar(effective, 200, 20);
    const growthStr = growth >= 0.5 ? ` (+${Math.round(growth)})` : '';
    return `  ${stat.padEnd(10)} ${bar} ${effective}${growthStr}`;
}
function getNextTier(currentTier) {
    const idx = EVOLUTION_TIERS.indexOf(currentTier);
    if (idx < 0 || idx >= EVOLUTION_TIERS.length - 1)
        return null;
    const next = EVOLUTION_TIERS[idx + 1];
    return { tier: next, threshold: TIER_THRESHOLDS[next] };
}
const TIER_ICONS = {
    hatchling: '🥚',
    juvenile: '⚡',
    adult: '🌟',
    elder: '👑',
    ascended: '✨',
};
const SPECIES_ICONS = {
    duck: '🦆', goose: '🪿', blob: '🫧', cat: '🐱', dragon: '🐉',
    octopus: '🐙', owl: '🦉', penguin: '🐧', turtle: '🐢', snail: '🐌',
    ghost: '👻', axolotl: '🦎', capybara: '🦫', cactus: '🌵', robot: '🤖',
    rabbit: '🐰', mushroom: '🍄', chonk: '🐈',
};
export function renderEvoStatus(bones, state, companionName) {
    const sprite = renderEvolvedSprite(bones, state, 0);
    const speciesIcon = SPECIES_ICONS[bones.species] || '🐾';
    const tierIcon = TIER_ICONS[state.tier] || '';
    const tierName = state.tier.charAt(0).toUpperCase() + state.tier.slice(1);
    const next = getNextTier(state.tier);
    const nextThreshold = next ? next.threshold : state.totalXP;
    const currentThreshold = TIER_THRESHOLDS[state.tier];
    const progressInTier = state.totalXP - currentThreshold;
    const tierRange = nextThreshold - currentThreshold;
    const progressBar = renderProgressBar(progressInTier, tierRange, 16);
    const progressPct = tierRange > 0
        ? ((progressInTier / tierRange) * 100).toFixed(1)
        : '100.0';
    const streakMult = getStreakMultiplier(state.streak.currentDays);
    const streakStr = state.streak.currentDays > 0
        ? `🔥 ${state.streak.currentDays} days (${streakMult.toFixed(1)}x)`
        : 'None';
    const info = [
        `${speciesIcon} ${companionName || 'Unknown'} the ${bones.species.charAt(0).toUpperCase() + bones.species.slice(1)}`,
        '══════════════════════',
        `Tier: ${tierName} ${tierIcon}`,
        `XP: ${formatXP(state.totalXP)} / ${formatXP(nextThreshold)}`,
        `${progressBar} ${progressPct}%`,
        ``,
        `Rarity: ${bones.rarity.charAt(0).toUpperCase() + bones.rarity.slice(1)}   Streak: ${streakStr}`,
    ];
    const lines = [];
    const maxLines = Math.max(sprite.length, info.length);
    for (let i = 0; i < maxLines; i++) {
        const left = (sprite[i] || '').padEnd(28);
        const right = info[i] || '';
        lines.push(`${left}${right}`);
    }
    lines.push('');
    for (const stat of STAT_NAMES) {
        lines.push(renderStatBar(stat, bones.stats[stat], state.statGrowth[stat]));
    }
    if (next) {
        const remaining = nextThreshold - state.totalXP;
        lines.push('');
        lines.push(`  Next evolution at ${formatXP(nextThreshold)} XP — ${formatXP(remaining)} to go!`);
    }
    else {
        lines.push('');
        lines.push('  Max evolution reached!');
    }
    return lines.join('\n');
}
export function renderEvoStats(state) {
    const s = state.lifetimeStats;
    const lines = [
        '  Lifetime Stats',
        '  ─────────────────────',
        `  Sessions: ${s.totalSessions} (${s.totalSessionMinutes} min total)`,
        `  Tool Calls: ${s.totalToolCalls} (${s.rejectedToolCalls} rejected)`,
        `  File Edits: ${s.fileEdits}`,
        `  Test Runs: ${s.testRuns}`,
        `  Tokens: ${formatXP(s.totalOutputTokens)} output / ${formatXP(s.totalInputTokens)} input`,
        `  Context Resets: ${s.contextResets}`,
        `  Force Snips: ${s.forceSnips}`,
    ];
    return lines.join('\n');
}
//# sourceMappingURL=display.js.map