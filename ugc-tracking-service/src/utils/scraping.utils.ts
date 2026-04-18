/**
 * Fréquence adaptative (heures entre deux scrapings).
 * Vidéo récente → plus fréquent ; ensuite on espace pour limiter charge / rate limits.
 */
export function getScrapingFrequencyHours(createdAt: Date, _viewsGrowthRatePerDay?: number): number {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 2) return 2;
  if (ageInDays < 7) return 8;
  return 24;
}
