/**
 * Rating tier mapping - shared between client and server
 */
export const RATING_TIERS = {
  Masterpiece: 95,
  Excellent: 85,
  Good: 70,
  Okay: 55,
  Bad: 35,
  Awful: 15,
} as const;

export type RatingTier = keyof typeof RATING_TIERS;

/**
 * Get rating tier name from percentage
 */
export function getRatingTier(percentage: number): RatingTier {
  if (percentage >= 95) return 'Masterpiece';
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 70) return 'Good';
  if (percentage >= 55) return 'Okay';
  if (percentage >= 35) return 'Bad';
  return 'Awful';
}

/**
 * Get percentage from tier name
 */
export function getPercentageFromTier(tierName: RatingTier): number {
  return RATING_TIERS[tierName];
}

