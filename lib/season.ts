/**
 * Seasonal dressing for the age gate.
 *
 * Driven by the visitor's own clock, so it switches itself on and off with no
 * deploy: the Halloween scene runs through October and the morning after, and
 * outside that window the gate falls back to its year-round look.
 *
 * Only ever call this after mount — the prerendered HTML has no clock, so
 * deciding the season during render would desync hydration.
 */
export function isHalloweenSeason(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0-based: 9 is October.
  return month === 9 || (month === 10 && date.getDate() === 1);
}
