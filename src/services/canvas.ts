/**
 * Canvas helpers that work both in a Web Worker (OffscreenCanvas) and on the main
 * thread (HTMLCanvasElement fallback for older browsers).
 */

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
export type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

let offscreen2d: boolean | undefined;

/**
 * Safari 16.0–16.3 expose OffscreenCanvas without 2D support (getContext('2d') returns null),
 * so availability of the constructor alone is not enough.
 */
function hasOffscreen2d(): boolean {
  if (offscreen2d === undefined) {
    try {
      offscreen2d = typeof OffscreenCanvas !== 'undefined' && !!new OffscreenCanvas(1, 1).getContext('2d');
    } catch {
      offscreen2d = false;
    }
  }
  return offscreen2d;
}

export function createCanvas(width: number, height: number): AnyCanvas {
  if (hasOffscreen2d() || typeof document === 'undefined') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: AnyCanvas): AnyContext {
  const ctx = canvas.getContext('2d') as AnyContext | null;
  if (!ctx) throw new Error('err.canvasAlloc');
  return ctx;
}

/** Frees canvas memory early (important on iOS, which has a global canvas budget). */
export function releaseCanvas(canvas: AnyCanvas): void {
  canvas.width = 0;
  canvas.height = 0;
}

export async function canvasToBlob(canvas: AnyCanvas, type: string, quality?: number): Promise<Blob> {
  let blob: Blob | null;
  if ('convertToBlob' in canvas) {
    blob = await canvas.convertToBlob({ type, quality });
  } else {
    blob = await new Promise<Blob | null>((resolve) => (canvas as HTMLCanvasElement).toBlob(resolve, type, quality));
  }
  if (!blob || blob.size === 0) {
    throw new Error('err.encode');
  }
  return blob;
}

export function getImageData(canvas: AnyCanvas): ImageData {
  return context2d(canvas).getImageData(0, 0, canvas.width, canvas.height);
}
