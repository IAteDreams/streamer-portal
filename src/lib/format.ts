/**
 * Display formatters.
 *
 * Every one of these pins the locale to "en-US" and, for dates, the time zone
 * to UTC. Without that the server formats using the host's locale while the
 * browser reformats using the viewer's, and React reports a hydration mismatch
 * on the difference.
 */

const LOCALE = "en-US";

const compact = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const date = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeZone: "UTC",
});

/** 128400 -> "128.4K" */
export function formatCompact(value: number): string {
  return compact.format(value);
}

/** 1284.5 -> "$1,284.50" */
export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
  }).format(value);
}

/** ISO string -> "Aug 25, 2026, 9:12 AM UTC" */
export function formatDateTime(iso: string): string {
  return `${dateTime.format(new Date(iso))} UTC`;
}

/** ISO string -> "Aug 25, 2026" */
export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

/** 12.4 -> "+12.4%", -3.1 -> "-3.1%" */
export function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** 842.1 -> "+$842.10", -5000 -> "-$5,000.00". Intl supplies the minus; the plus is explicit. */
export function formatSignedCurrency(value: number, currency: string): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value, currency)}`;
}
