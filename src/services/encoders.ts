import { canvasToBlob, getImageData, type AnyCanvas } from './canvas';
import type { OutputOptions } from './types';

let nativeWebp: boolean | undefined;

/**
 * Encodes a canvas. WebP falls back to a WebAssembly encoder when the browser cannot
 * encode WebP natively (Safari/iOS silently return PNG instead). Lossy PNG uses palette
 * quantization (UPNG.js); lossless PNG uses the browser encoder.
 */
export async function encodeCanvas(canvas: AnyCanvas, out: OutputOptions): Promise<Blob> {
  const quality = Math.min(1, Math.max(0.01, out.quality));
  switch (out.format) {
    case 'jpeg':
      return canvasToBlob(canvas, 'image/jpeg', quality);
    case 'webp': {
      if (!out.webpLossless && nativeWebp !== false) {
        const blob = await canvasToBlob(canvas, 'image/webp', quality);
        nativeWebp = blob.type === 'image/webp';
        if (nativeWebp) return blob;
      }
      const { default: encodeWebp } = await import('@jsquash/webp/encode');
      const data = getImageData(canvas);
      const buffer = await encodeWebp(data, out.webpLossless ? { lossless: 1, quality: 100 } : { quality: Math.round(quality * 100) });
      return new Blob([buffer], { type: 'image/webp' });
    }
    case 'png': {
      const colors = out.pngColors ?? 0;
      if (colors >= 2 && colors <= 256) {
        const { default: UPNG } = await import('upng-js');
        const data = getImageData(canvas);
        const buffer = UPNG.encode([data.data.buffer as ArrayBuffer], canvas.width, canvas.height, colors);
        return new Blob([buffer], { type: 'image/png' });
      }
      return canvasToBlob(canvas, 'image/png');
    }
  }
}
