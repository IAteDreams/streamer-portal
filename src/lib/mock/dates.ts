/**
 * Mock timestamps are generated relative to the current request rather than
 * hardcoded, so date-dependent UI (the /posts range filters, the wallet
 * history) always has recent-looking content. With fixed timestamps those
 * views would silently go stale as real time moved past them.
 */
export function daysAgo(days: number, hour = 12): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}
