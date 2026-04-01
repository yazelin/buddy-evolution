/**
 * Base sprite rendering system from the BUDDY companion pet.
 * 18 species x 3 animation frames, 5 lines tall, 12 chars wide.
 * Line 0 reserved for hats, {E} placeholder for eyes.
 */
import type { CompanionBones, Species } from './types.js';
declare const SPRITE_WIDTH = 12;
declare const SPRITE_HEIGHT = 5;
declare const SPRITE_DATA: Record<Species, string[][]>;
export declare function renderFace(bones: CompanionBones): string;
export declare function spriteFrameCount(_species: Species): number;
export declare function renderSprite(bones: CompanionBones, frameIndex?: number): string[];
export { SPRITE_WIDTH, SPRITE_HEIGHT, SPRITE_DATA };
