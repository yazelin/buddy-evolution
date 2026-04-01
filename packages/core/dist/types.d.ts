/**
 * Mirrored base types from the BUDDY companion pet system.
 * These faithfully reproduce the original type definitions and deterministic
 * generation constants. Species, rarity, stats are all derived from account ID.
 */
export declare const SPECIES: readonly ["duck", "goose", "blob", "cat", "dragon", "octopus", "owl", "penguin", "turtle", "snail", "ghost", "axolotl", "capybara", "cactus", "robot", "rabbit", "mushroom", "chonk"];
export type Species = (typeof SPECIES)[number];
export declare const EYES: readonly ["·", "✦", "×", "◉", "@", "°"];
export type Eye = (typeof EYES)[number];
export declare const HATS: readonly ["none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", "tinyduck"];
export type Hat = (typeof HATS)[number];
export declare const RARITIES: readonly ["common", "uncommon", "rare", "epic", "legendary"];
export type Rarity = (typeof RARITIES)[number];
export declare const RARITY_WEIGHTS: {
    rarity: Rarity;
    weight: number;
    statFloor: number;
}[];
export declare const STAT_NAMES: readonly ["DEBUGGING", "PATIENCE", "CHAOS", "WISDOM", "SNARK"];
export type StatName = (typeof STAT_NAMES)[number];
export type Stats = Record<StatName, number>;
export interface CompanionBones {
    rarity: Rarity;
    species: Species;
    eye: Eye;
    hat: Hat;
    shiny: boolean;
    stats: Stats;
    inspirationSeed: number;
}
export interface CompanionSoul {
    name: string;
    personality: string;
}
export interface Companion extends CompanionBones, CompanionSoul {
    hatchedAt: number;
}
export interface StoredCompanion extends CompanionSoul {
    hatchedAt: number;
}
export declare const COMPANION_SALT = "friend-2026-401";
