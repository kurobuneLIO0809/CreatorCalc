/**
 * Canvas helpers that work both in a Web Worker (OffscreenCanvas) and on the main
 * thread (HTMLCanvasElement fallback for older browsers).
 */

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
export type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function context2d(canvas: AnyCanvas): AnyContext {
  const ctx = canvas.getContext('2d') as AnyContext | null;
  if (!ctx) throw new Error('Could not allocate an image canvas. The image may be too large for this browser.');
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
    throw new Error('This browser could not encode the image. It may be too large — try resizing it first.');
  }
  return blob;
}

export function getImageData(canvas: AnyCanvas): ImageData {
  return context2d(canvas).getImageData(0, 0, canvas.width, canvas.height);
}
