/**
 * Search for the highest-quality encoding that fits a byte budget.
 * The encoder is injected, so the algorithm is unit-testable without a browser.
 *
 * Strategy:
 * 1. Try the maximum quality at full size — if it fits, stop (never degrade needlessly).
 * 2. Binary-search the quality between `minQuality` and `maxQuality`.
 * 3. If even `minQuality` is too large, shrink the dimensions proportionally to the
 *    overshoot and search again (at most `maxScaleSteps` times).
 */

export interface EncodeAttempt<T> {
  result: T;
  size: number;
}

export type TargetEncoder<T> = (quality: number, scale: number) => Promise<EncodeAttempt<T>>;

export interface TargetSearchOptions {
  minQuality?: number;
  maxQuality?: number;
  qualitySteps?: number;
  maxScaleSteps?: number;
  /** Smallest allowed scale factor (relative to the original dimensions). */
  minScale?: number;
  signal?: AbortSignal;
}

export interface TargetSearchResult<T> {
  result: T;
  size: number;
  quality: number;
  scale: number;
  fits: boolean;
  attempts: number;
}

export async function searchTargetSize<T>(
  encode: TargetEncoder<T>,
  targetBytes: number,
  options: TargetSearchOptions = {},
): Promise<TargetSearchResult<T>> {
  const minQ = options.minQuality ?? 0.4;
  const maxQ = options.maxQuality ?? 0.92;
  const steps = options.qualitySteps ?? 7;
  const maxScaleSteps = options.maxScaleSteps ?? 8;
  const minScale = options.minScale ?? 0.02;
  let attempts = 0;

  const run = async (q: number, s: number) => {
    if (options.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    attempts += 1;
    return encode(q, s);
  };

  let scale = 1;
  let smallest: TargetSearchResult<T> | null = null;

  for (let round = 0; round <= maxScaleSteps; round++) {
    const top = await run(maxQ, scale);
    if (top.size <= targetBytes) {
      return { result: top.result, size: top.size, quality: maxQ, scale, fits: true, attempts };
    }
    const bottom = await run(minQ, scale);
    if (!smallest || bottom.size < smallest.size) {
      smallest = { result: bottom.result, size: bottom.size, quality: minQ, scale, fits: false, attempts };
    }
    if (bottom.size <= targetBytes) {
      let lo = minQ;
      let hi = maxQ;
      let best: TargetSearchResult<T> = { result: bottom.result, size: bottom.size, quality: minQ, scale, fits: true, attempts };
      for (let i = 0; i < steps; i++) {
        const mid = Math.round(((lo + hi) / 2) * 1000) / 1000;
        if (mid <= lo || mid >= hi) break;
        const attempt = await run(mid, scale);
        if (attempt.size <= targetBytes) {
          best = { result: attempt.result, size: attempt.size, quality: mid, scale, fits: true, attempts };
          lo = mid;
        } else {
          hi = mid;
        }
      }
      best.attempts = attempts;
      return best;
    }
    if (scale <= minScale) break;
    // File size scales roughly with pixel count, i.e. with scale². Undershoot a little.
    const ratio = Math.sqrt(targetBytes / bottom.size) * 0.95;
    scale = Math.max(minScale, scale * Math.min(ratio, 0.9));
  }

  if (!smallest) throw new Error('No encoding attempt was made');
  smallest.attempts = attempts;
  return smallest;
}
