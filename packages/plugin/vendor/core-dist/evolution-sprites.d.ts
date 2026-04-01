/**
 * Tier-aware sprite overlay system.
 * Applies additive visual effects based on evolution tier.
 * Never modifies the base sprite — overlays are composited on top.
 *
 * Pipeline: renderSprite → applyPattern → applyAura → applyParticles
 */
import type { CompanionBones } from './types.js';
import type { EvolutionState, EvolutionTier } from './evolution-types.js';
/**
 * Render a sprite with tier-appropriate evolution overlays.
 *
 * Overlay pipeline (cumulative — higher tiers include all lower effects):
 * - Hatchling: base sprite only
 * - Juvenile: + corner markers
 * - Adult: + species pattern fill (includes Juvenile markers)
 * - Elder: + aura border (includes all above)
 * - Ascended: + floating particles (includes all above)
 */
export declare function renderEvolvedSprite(bones: CompanionBones, state: EvolutionState, frame: number): string[];
export declare function tierAtLeast(tier: EvolutionTier, target: EvolutionTier): boolean;
/**
 * Get a description of the visual effects for a given tier.
 */
export declare function getTierVisualDescription(tier: EvolutionTier): string;
