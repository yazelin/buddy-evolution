import { type CompanionBones, type EvolutionState, type StatName } from '@buddy-evolution/core';
export declare function formatXP(xp: number): string;
export declare function renderProgressBar(current: number, max: number, width: number): string;
export declare function renderStatBar(stat: StatName, base: number, growth: number): string;
export declare function renderEvoStatus(bones: CompanionBones, state: EvolutionState, companionName: string): string;
export declare function renderEvoStats(state: EvolutionState): string;
