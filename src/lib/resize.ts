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

/** Crop-frame handles: move the whole frame, an edge, or a corner. */
export type Handle = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Pure geometry for a drag gesture, in natural image pixels. */
export function dragRect(mode: Handle, start: Rect, dx: number, dy: number, bounds: Size, ratio?: number): Rect {
  const W = bounds.width;
  const H = bounds.height;
  const MIN = Math.min(8, W, H);
  if (mode === 'move') {
    return { x: clamp(start.x + dx, 0, W - start.width), y: clamp(start.y + dy, 0, H - start.height), width: start.width, height: start.height };
  }
  let x1 = start.x;
  let y1 = start.y;
  let x2 = start.x + start.width;
  let y2 = start.y + start.height;
  if (mode.includes('w')) x1 = clamp(x1 + dx, 0, x2 - MIN);
  if (mode.includes('e')) x2 = clamp(x2 + dx, x1 + MIN, W);
  if (mode.includes('n')) y1 = clamp(y1 + dy, 0, y2 - MIN);
  if (mode.includes('s')) y2 = clamp(y2 + dy, y1 + MIN, H);
  if (ratio && mode.length === 2) {
    let w = x2 - x1;
    let h = w / ratio;
    const available = mode.includes('n') ? y2 : H - y1;
    if (h > available) {
      h = available;
      w = h * ratio;
    }
    if (mode.includes('n')) y1 = y2 - h;
    else y2 = y1 + h;
    if (mode.includes('w')) x1 = x2 - w;
    else x2 = x1 + w;
  }
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}
