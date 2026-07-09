export const SCORE_PER_TILE = 10;
export const SPECIAL_ACTIVATION_BONUS = 50;

/** Later cascades in the same move score progressively more. */
export function cascadeMultiplier(cascadeIndex: number): number {
  return 1 + cascadeIndex * 0.5;
}
