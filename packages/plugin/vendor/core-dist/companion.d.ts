/**
 * Mirrored deterministic companion generation from account ID.
 * Faithful reproduction of the original Mulberry32 PRNG seeded from FNV-1a hash.
 * Species, rarity, stats are all deterministic and never change.
 */
import { type CompanionBones } from './types.js';
declare function fnv1aHash(str: string): number;
declare function mulberry32(seed: number): () => number;
export declare function rollCompanionBones(userId: string): CompanionBones;
export declare function clearRollCache(): void;
export { fnv1aHash, mulberry32 };
