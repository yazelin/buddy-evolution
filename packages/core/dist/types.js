/**
 * Mirrored base types from the BUDDY companion pet system.
 * These faithfully reproduce the original type definitions and deterministic
 * generation constants. Species, rarity, stats are all derived from account ID.
 */
// --- Species ---
export const SPECIES = [
    'duck', 'goose', 'blob', 'cat', 'dragon', 'octopus',
    'owl', 'penguin', 'turtle', 'snail', 'ghost', 'axolotl',
    'capybara', 'cactus', 'robot', 'rabbit', 'mushroom', 'chonk',
];
// --- Eyes ---
export const EYES = ['·', '✦', '×', '◉', '@', '°'];
// --- Hats ---
export const HATS = [
    'none', 'crown', 'tophat', 'propeller', 'halo',
    'wizard', 'beanie', 'tinyduck',
];
// --- Rarity ---
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const RARITY_WEIGHTS = [
    { rarity: 'common', weight: 0.60, statFloor: 5 },
    { rarity: 'uncommon', weight: 0.25, statFloor: 15 },
    { rarity: 'rare', weight: 0.10, statFloor: 25 },
    { rarity: 'epic', weight: 0.04, statFloor: 35 },
    { rarity: 'legendary', weight: 0.01, statFloor: 50 },
];
// --- Stats ---
export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK'];
// --- PRNG salt (matches original) ---
export const COMPANION_SALT = 'friend-2026-401';
//# sourceMappingURL=types.js.map