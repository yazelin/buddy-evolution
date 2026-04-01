/**
 * XP calculation engine.
 * Converts session metrics into XP using token rates, tool call bonuses,
 * quest completion rewards, and streak multipliers.
 */
import type { SessionMetrics, StreakInfo } from './evolution-types.js';
/**
 * Calculate the streak multiplier based on consecutive days.
 * Day 1 = 1.0x, scales +0.1x per day, caps at 2.0x (day 11+).
 */
export declare function getStreakMultiplier(currentDays: number): number;
/**
 * Update streak based on session date vs last session date.
 * - Same day: streak unchanged
 * - Next day: streak + 1
 * - Gap of 2+ days: reset to 1
 */
export declare function updateStreak(streak: StreakInfo, sessionDate: string): StreakInfo;
/**
 * Calculate base XP from a session (before streak multiplier).
 */
export declare function calculateBaseXP(session: SessionMetrics): number;
/**
 * Calculate total session XP with streak multiplier applied.
 */
export declare function calculateSessionXP(session: SessionMetrics, streak: StreakInfo): number;
