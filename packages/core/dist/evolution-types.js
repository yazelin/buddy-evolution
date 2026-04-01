/**
 * Evolution system types — the RPG layer on top of static companion bones.
 * Evolution is purely additive: it never mutates the deterministic base pet.
 */
// --- Evolution Tiers ---
export const EVOLUTION_TIERS = [
    'hatchling', 'juvenile', 'adult', 'elder', 'ascended',
];
export const TIER_THRESHOLDS = {
    hatchling: 0,
    juvenile: 100_000,
    adult: 1_000_000,
    elder: 10_000_000,
    ascended: 100_000_000,
};
/** Ordered from highest to lowest for tier resolution */
export const TIER_ORDER = [
    { tier: 'ascended', threshold: 100_000_000 },
    { tier: 'elder', threshold: 10_000_000 },
    { tier: 'adult', threshold: 1_000_000 },
    { tier: 'juvenile', threshold: 100_000 },
    { tier: 'hatchling', threshold: 0 },
];
// --- XP Constants ---
export const XP_RATES = {
    OUTPUT_TOKEN: 1.0,
    INPUT_TOKEN: 0.5,
    TOOL_CALL: 100,
    QUEST_BONUS: 5000,
    QUEST_THRESHOLD_MINUTES: 30,
};
export const STREAK = {
    MAX_MULTIPLIER: 2.0,
    INCREMENT_PER_DAY: 0.1,
    BASE_MULTIPLIER: 1.0,
};
//# sourceMappingURL=evolution-types.js.map