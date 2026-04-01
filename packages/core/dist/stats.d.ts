/**
 * Usage-driven stat growth system.
 * Each stat is driven by specific usage patterns from session metrics.
 * Growth uses diminishing returns to soft-cap near +100 bonus.
 */
import type { StatName } from './types.js';
import type { SessionMetrics } from './evolution-types.js';
/**
 * Calculate raw stat growth from a session for a given stat.
 * Each stat has a unique driver formula.
 */
export declare function calculateRawStatGrowth(stat: StatName, session: SessionMetrics): number;
/**
 * Apply diminishing returns to raw growth.
 * Formula: rawGrowth * (100 / (100 + currentGrowth))
 *
 * At currentGrowth=0: full raw growth applied
 * At currentGrowth=100: half of raw growth applied
 * At currentGrowth=900: 10% of raw growth applied
 * Approaches but never reaches +infinity asymptotically
 */
export declare function applyDiminishingReturns(rawGrowth: number, currentGrowth: number): number;
/**
 * Calculate actual stat growth for a session, accounting for diminishing returns.
 */
export declare function calculateStatGrowth(stat: StatName, session: SessionMetrics, currentGrowth: number): number;
/**
 * Compute the effective (display) stat value.
 * Base stat (1-100 from bones) + growth bonus, clamped to [1, 200].
 */
export declare function getEffectiveStat(baseStat: number, growthBonus: number): number;
