/**
 * Core evolution orchestrator.
 * Processes session-end events to update XP, stats, streaks, and tier.
 * This is the single entry point for all evolution state transitions.
 */
import type { EvolutionState, EvolutionTier, SessionMetrics, EvolutionResult } from './evolution-types.js';
/**
 * Resolve the evolution tier from total XP.
 */
export declare function resolveTier(totalXP: number): EvolutionTier;
/**
 * Create a fresh default evolution state (new hatchling).
 */
export declare function createDefaultEvolutionState(): EvolutionState;
/**
 * Process a session end and produce the new evolution state.
 * This is the main entry point — called once per session.
 */
export declare function processSessionEnd(currentState: EvolutionState, session: SessionMetrics): EvolutionResult;
