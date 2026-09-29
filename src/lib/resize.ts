/** Pure geometry helpers for resizing, cropping and rotation. */

export interface Size {
  width: number;
  height: number;
}

export type ResizeSpec =
  | { mode: 'none' }
  | { mode: 'percent'; percent: number }
  | { mode: 'dimensions'; width?: number; height?: number; keepAspect: boolean }
  | { mode: 'longest'; longest: number };

const clampDim = (n: number) => Math.max(1, Math.round(n));

/**
 * Computes output dimensions for a resize request.
 * - `dimensions` with keepAspect: fits inside the box (either side may be omitted).
 * - `allowUpscale=false` keeps images that are already smaller untouched.
 */
export function computeResize(src: Size, spec: ResizeSpec, allowUpscale = true): Size {
  let w = src.width;
  let h = src.height;
  switch (spec.mode) {
    case 'none':
      return { width: w, height: h };
    case 'percent': {
      const p = Number.isFinite(spec.percent) && spec.percent > 0 ? spec.percent : 100;
      w = src.width * (p / 100);
      h = src.height * (p / 100);
      break;
    }
    case 'longest': {
      const longest = Math.max(src.width, src.height);
      const scale = spec.longest > 0 ? spec.longest / longest : 1;
      w = src.width * scale;
      h = src.height * scale;
      break;
    }
    case 'dimensions': {
      const tw = spec.width && spec.width > 0 ? spec.width : undefined;
      const th = spec.height && spec.height > 0 ? spec.height : undefined;
      if (!tw && !th) return { width: w, height: h };
      if (!spec.keepAspect) {
        w = tw ?? src.width;
        h = th ?? src.height;
      } else {
        const scale = Math.min(tw ? tw / src.width : Infinity, th ? th / src.height : Infinity);
        w = src.width * scale;
        h = src.height * scale;
      }
      break;
    }
  }
  if (!allowUpscale && (w > src.width || h > src.height)) {
    const scale = Math.min(src.width / w, src.height / h);
    w *= scale;
    h *= scale;
  }
  return { width: clampDim(w), height: clampDim(h) };
}

/** Scale factor (<= 1) that keeps width*height within maxPixels and each side within maxSide. */
export function fitScale(size: Size, maxPixels: number, maxSide = Infinity): number {
  const pixels = size.width * size.height;
  let scale = 1;
  if (pixels > maxPixels) scale = Math.sqrt(maxPixels / pixels);
  const longest = Math.max(size.width, size.height) * scale;
  if (longest > maxSide) scale *= maxSide / longest;
  return Math.min(1, scale);
}

export type Rotation = 0 | 90 | 180 | 270;

export function normalizeRotation(deg: number): Rotation {
  const r = (((Math.round(deg / 90) * 90) % 360) + 360) % 360;
  return r as Rotation;
}

export function rotatedSize(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270 ? { width: size.height, height: size.width } : { ...size };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Clamps a crop rectangle to the image bounds and rounds to whole pixels. */
export function clampRect(rect: Rect, bounds: Size): Rect {
  const x = Math.min(Math.max(0, Math.round(rect.x)), bounds.width - 1);
  const y = Math.min(Math.max(0, Math.round(rect.y)), bounds.height - 1);
  const width = Math.min(Math.max(1, Math.round(rect.width)), bounds.width - x);
  const height = Math.min(Math.max(1, Math.round(rect.height)), bounds.height - y);
  return { x, y, width, height };
}

/** Largest centered rectangle with the given aspect ratio (width / height) inside bounds. */
export function centeredAspectRect(bounds: Size, aspect: number): Rect {
  let width = bounds.width;
  let height = width / aspect;
  if (height > bounds.height) {
    height = bounds.height;
    width = height * aspect;
  }
  return clampRect({ x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height }, bounds);
}
