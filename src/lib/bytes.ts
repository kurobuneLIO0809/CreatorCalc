/** Human-readable byte size using binary units (1 KB = 1024 bytes), matching how OSes and upload forms usually count. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unit]}`;
}

/** Signed percentage change from `before` to `after`, e.g. -42 for a 42% reduction. */
export function percentChange(before: number, after: number): number {
  if (!before) return 0;
  return Math.round(((after - before) / before) * 1000) / 10;
}

export function describeChange(before: number, after: number): string {
  const pct = percentChange(before, after);
  if (pct < 0) return `${Math.abs(pct)}% smaller`;
  if (pct > 0) return `${pct}% larger`;
  return 'same size';
}

/**
 * Converts a size limit in KB to a safe byte budget. Upload forms disagree on whether
 * 1 KB is 1,000 or 1,024 bytes, so we use the stricter 1,000 — a file under the budget
 * passes either check. Returns null for invalid input.
 */
export function kbToSafeBytes(kb: number): number | null {
  if (!Number.isFinite(kb) || kb <= 0) return null;
  return Math.floor(kb * 1000);
}
