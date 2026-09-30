/**
 * The image pipeline shared by all raster tools:
 * decode → crop → rotate/flip → resize → flatten (JPEG) → encode (optionally to a byte budget).
 * Runs inside a Web Worker when OffscreenCanvas is available, otherwise on the main thread.
 */
import { clampRect, computeResize, fitScale, rotatedSize, type Rect, type Rotation, type Size } from '../lib/resize';
import { limits } from '../config/site';
import { searchTargetSize } from '../lib/target-size';
import { context2d, createCanvas, releaseCanvas, type AnyCanvas } from './canvas';
import { encodeCanvas } from './encoders';
import type { Note, PipelineOptions, PipelineResult } from './types';

export async function decodeBlob(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('err.decode');
  }
}

interface DrawSpec {
  crop: Rect;
  rotate: Rotation;
  flipH: boolean;
  flipV: boolean;
  background?: string;
}

/** Draws the crop region rotated/flipped into a new canvas of the given output size. */
function render(src: CanvasImageSource, spec: DrawSpec, outW: number, outH: number): AnyCanvas {
  const quarter = spec.rotate === 90 || spec.rotate === 270;
  const targetW = quarter ? outH : outW;
  const targetH = quarter ? outW : outH;
  let source: CanvasImageSource = src;
  let { x: sx, y: sy, width: sw, height: sh } = spec.crop;
  const temps: AnyCanvas[] = [];

  // Progressive halving gives much better quality than a single large downscale.
  while (sw / 2 >= targetW && sh / 2 >= targetH && sw > 2 && sh > 2) {
    const w = Math.ceil(sw / 2);
    const h = Math.ceil(sh / 2);
    const step = createCanvas(w, h);
    const sctx = context2d(step);
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
    if (temps.length) releaseCanvas(temps[temps.length - 1]);
    temps.push(step);
    source = step as CanvasImageSource;
    sx = 0;
    sy = 0;
    sw = w;
    sh = h;
  }

  const canvas = createCanvas(outW, outH);
  const ctx = context2d(canvas);
  if (spec.background) {
    ctx.fillStyle = spec.background;
    ctx.fillRect(0, 0, outW, outH);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(outW / 2, outH / 2);
  ctx.scale(spec.flipH ? -1 : 1, spec.flipV ? -1 : 1);
  ctx.rotate((spec.rotate * Math.PI) / 180);
  ctx.drawImage(source, sx, sy, sw, sh, -targetW / 2, -targetH / 2, targetW, targetH);
  temps.forEach(releaseCanvas);
  return canvas;
}

export async function runPipeline(source: ImageBitmap, options: PipelineOptions, signal?: AbortSignal): Promise<PipelineResult> {
  const notes: Note[] = [];
  const bounds: Size = { width: source.width, height: source.height };
  const crop = options.crop ? clampRect(options.crop, bounds) : { x: 0, y: 0, ...bounds };
  const rotate = options.rotate ?? 0;
  const oriented = rotatedSize({ width: crop.width, height: crop.height }, rotate);
  let out = computeResize(oriented, options.resize ?? { mode: 'none' }, options.allowUpscale ?? true);
  const safe = fitScale(out, options.maxCanvasPixels, options.maxCanvasSide);
  if (safe < 1) {
    out = { width: Math.max(1, Math.floor(out.width * safe)), height: Math.max(1, Math.floor(out.height * safe)) };
    notes.push({ key: 'note.memoryLimit', params: { w: out.width, h: out.height } });
  }

  if (options.output.format === 'png' && (options.output.pngColors ?? 0) > 0 && out.width * out.height > limits.maxQuantizePixels) {
    options = { ...options, output: { ...options.output, pngColors: 0 } };
    notes.push({ key: 'note.quantizeSkipped' });
  }

  const background = options.output.format === 'jpeg' ? options.output.background || '#ffffff' : options.output.background;
  const spec: DrawSpec = { crop, rotate, flipH: !!options.flipH, flipV: !!options.flipV, background };
  const sizeAt = (scale: number) => ({
    width: Math.max(1, Math.round(out.width * scale)),
    height: Math.max(1, Math.round(out.height * scale)),
  });

  if (options.targetBytes) {
    let cached: { scale: number; canvas: AnyCanvas } | null = null;
    const minScale = Math.min(1, 16 / Math.max(out.width, out.height));
    const search = await searchTargetSize(
      async (quality, scale) => {
        if (!cached || cached.scale !== scale) {
          if (cached) releaseCanvas(cached.canvas);
          const s = sizeAt(scale);
          cached = { scale, canvas: render(source, spec, s.width, s.height) };
        }
        const blob = await encodeCanvas(cached.canvas, { ...options.output, quality });
        return { result: { blob, width: cached.canvas.width, height: cached.canvas.height }, size: blob.size };
      },
      options.targetBytes,
      { signal, minScale, maxQuality: Math.min(0.95, Math.max(0.5, options.output.quality)) },
    );
    if (cached) releaseCanvas((cached as { canvas: AnyCanvas }).canvas);
    if (search.scale < 1) {
      notes.push({ key: 'note.targetDownscale', params: { w: search.result.width, h: search.result.height } });
    }
    return {
      blob: search.result.blob,
      width: search.result.width,
      height: search.result.height,
      format: options.output.format,
      quality: options.output.format === 'png' ? undefined : search.quality,
      fitsTarget: search.fits,
      notes,
    };
  }

  const canvas = render(source, spec, out.width, out.height);
  try {
    const blob = await encodeCanvas(canvas, options.output);
    return { blob, width: out.width, height: out.height, format: options.output.format, quality: options.output.quality, notes };
  } finally {
    releaseCanvas(canvas);
  }
}
