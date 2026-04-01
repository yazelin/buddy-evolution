/**
 * Evolution system types — the RPG layer on top of static companion bones.
 * Evolution is purely additive: it never mutates the deterministic base pet.
 */
import type { StatName, CompanionSoul } from './types.js';
export declare const EVOLUTION_TIERS: readonly ["hatchling", "juvenile", "adult", "elder", "ascended"];
export type EvolutionTier = (typeof EVOLUTION_TIERS)[number];
export declare const TIER_THRESHOLDS: Record<EvolutionTier, number>;
/** Ordered from highest to lowest for tier resolution */
export declare const TIER_ORDER: {
    tier: EvolutionTier;
    threshold: number;
}[];
export declare const XP_RATES: {
    readonly OUTPUT_TOKEN: 1;
    readonly INPUT_TOKEN: 0.5;
    readonly TOOL_CALL: 100;
    readonly QUEST_BONUS: 5000;
    readonly QUEST_THRESHOLD_MINUTES: 30;
};
export declare const STREAK: {
    readonly MAX_MULTIPLIER: 2;
    readonly INCREMENT_PER_DAY: 0.1;
    readonly BASE_MULTIPLIER: 1;
};
export interface LifetimeStats {
    totalOutputTokens: number;
    totalInputTokens: number;
    totalToolCalls: number;
    totalSessions: number;
    totalSessionMinutes: number;
    rejectedToolCalls: number;
    forceSnips: number;
    contextResets: number;
    fileEdits: number;
    testRuns: number;
}
export interface StreakInfo {
    currentDays: number;
    lastSessionDate: string;
}
export interface EvolutionState {
    totalXP: number;
    tier: EvolutionTier;
    lifetimeStats: LifetimeStats;
    streak: StreakInfo;
    statGrowth: Record<StatName, number>;
    customTitle?: string;
    evolvedAt: Record<EvolutionTier, number | null>;
}
export interface SessionMetrics {
    outputTokens: number;
    inputTokens: number;
    toolCalls: number;
    rejectedToolCalls: number;
    sessionDurationMinutes: number;
    fileEdits: number;
    testRuns: number;
    forceSnips: number;
    contextResets: number;
    sessionDate: string;
}
export interface StoredCompanionWithEvolution extends CompanionSoul {
    hatchedAt: number;
    evolution?: EvolutionState;
}
export interface EvolutionResult {
    newState: EvolutionState;
    tierChanged: boolean;
    previousTier: EvolutionTier;
    xpGained: number;
}
export interface SpriteOverlay {
    pattern?: string[];
    aura?: string[];
    particles?: string[];
}
