/**
 * Main-thread entry point for image processing: validates inputs before decoding, decodes
 * HEIC when needed, and runs the pipeline in a Web Worker (cancellable) or on the main
 * thread as a fallback. Nothing here performs network requests with user data.
 */
import { features, limits } from '../config/site';
import { FORMAT_INFO, formatLabel, readDimensions, sniffFormat, type DetectedFormat } from '../lib/format';
import { decodeBlob, runPipeline } from './pipeline';
import type { PipelineOptions, PipelineResult, WorkerRequest, WorkerResponse } from './types';

export interface InputInfo {
  format: DetectedFormat;
  width?: number;
  height?: number;
  /** Header indicates an animation (APNG, animated GIF/WebP). Only the first frame is processed. */
  animated?: boolean;
}

function looksAnimated(head: Uint8Array, format: DetectedFormat): boolean {
  const text = (needle: string) => {
    outer: for (let i = 0; i + needle.length <= head.length; i++) {
      for (let j = 0; j < needle.length; j++) if (head[i + j] !== needle.charCodeAt(j)) continue outer;
      return true;
    }
    return false;
  };
  if (format === 'webp') return head.length > 20 && String.fromCharCode(...head.subarray(12, 16)) === 'VP8X' && (head[20] & 0x02) !== 0;
  if (format === 'gif') return text('NETSCAPE2.0') || text('ANIMEXTS1.0');
  if (format === 'png') return text('acTL');
  return false;
}

export class InputError extends Error {
  constructor(
    message: string,
    /** The detected format, when the file is a valid image this tool does not accept. */
    readonly format?: DetectedFormat,
  ) {
    super(message);
  }
}

const HEADER_BYTES = 512 * 1024;

/** Reads the file header and rejects unsupported, spoofed, empty, oversized or bomb-like files. */
export async function inspectFile(file: File, accept: readonly DetectedFormat[]): Promise<InputInfo> {
  if (file.size === 0) throw new InputError('This file is empty.');
  if (file.size > limits.maxFileBytes) {
    throw new InputError(`This file is larger than ${Math.round(limits.maxFileBytes / 1024 / 1024)} MB, the limit for in-browser processing.`);
  }
  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
  } catch {
    throw new InputError('This file could not be read. It may have been moved or deleted.');
  }
  const format = sniffFormat(head);
  if (format === 'svg') throw new InputError('SVG files are not supported here, because they can contain scripts. Use a raster image (JPG, PNG, WebP…).');
  if (format === 'pdf') throw new InputError('This is a PDF document, not an image.');
  if (format === 'unknown') throw new InputError('This file is not a supported image. Its content does not match any known image format (the file name or extension may be wrong).');
  if (!accept.includes(format)) {
    throw new InputError(`${formatLabel(format)} files are not supported by this tool.`, format);
  }
  const dims = readDimensions(head, format);
  if (dims) {
    if (dims.width === 0 || dims.height === 0) throw new InputError('This image reports a size of 0 pixels and is probably damaged.');
    if (dims.width * dims.height > maxDecodePixels()) {
      throw new InputError(
        `This image is ${dims.width.toLocaleString()} × ${dims.height.toLocaleString()} px, which is more than a browser can safely decode (${Math.round(maxDecodePixels() / 1e6)} megapixels max on this device).`,
      );
    }
  }
  return { format, ...(dims ?? {}), animated: looksAnimated(head.subarray(0, 65536), format) };
}

export function isMobileWebKit(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** Device RAM in GB when the browser reports it (Chromium), else undefined. */
function deviceMemory(): number | undefined {
  const m = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined;
  return typeof m === 'number' && m > 0 ? m : undefined;
}

export function canvasBudget() {
  let maxCanvasPixels: number = limits.maxCanvasPixelsDesktop;
  if (isMobileWebKit()) maxCanvasPixels = limits.maxCanvasPixelsMobileWebKit;
  else if ((deviceMemory() ?? 8) <= 4) maxCanvasPixels = limits.maxCanvasPixelsLowMemory;
  return { maxCanvasPixels, maxCanvasSide: limits.maxCanvasSide };
}

/** Largest image we let the browser decode at full size on this device. */
export function maxDecodePixels(): number {
  const mem = deviceMemory();
  if (mem !== undefined && mem <= 2) return 40_000_000;
  if (mem !== undefined && mem <= 4) return 80_000_000;
  return limits.maxInputPixels;
}

function supportsWorkerPipeline(): boolean {
  try {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && !!new OffscreenCanvas(1, 1).getContext('2d') && 'convertToBlob' in OffscreenCanvas.prototype;
  } catch {
    return false;
  }
}

/** HEIC: use the OS decoder when the browser has one (Safari), else load the WASM/JS decoder on demand. */
export async function decodeHeic(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Not natively supported — fall through to the bundled decoder.
  }
  if (!features.heicDecoder) {
    throw new Error('This browser cannot open HEIC files. Open the photo in Safari (Mac, iPhone, iPad), or set your iPhone camera to “Most Compatible” to save JPGs.');
  }
  const { heicTo } = await import('heic-to/csp');
  try {
    return await heicTo({ blob: file, type: 'bitmap', options: { imageOrientation: 'from-image' } });
  } catch {
    throw new Error('This HEIC file could not be decoded. It may be damaged, or use a HEIF variant that is not supported yet.');
  }
}

export function abortError(): DOMException {
  return new DOMException('Cancelled', 'AbortError');
}

export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Runs pipeline jobs one at a time. Cancelling terminates the worker immediately. */
export class ImageEngine {
  private worker: Worker | null = null;
  private nextId = 1;
  private readonly useWorker = supportsWorkerPipeline();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module', name: 'image-pipeline' });
    }
    return this.worker;
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  async process(file: File, info: InputInfo, options: Omit<PipelineOptions, 'maxCanvasPixels' | 'maxCanvasSide'>, signal?: AbortSignal): Promise<PipelineResult> {
    if (signal?.aborted) throw abortError();
    const full: PipelineOptions = { ...options, ...canvasBudget() };
    const source: Blob | ImageBitmap = info.format === 'heic' ? await decodeHeic(file) : file;
    if (signal?.aborted) {
      if (source instanceof ImageBitmap) source.close();
      throw abortError();
    }

    if (!this.useWorker) {
      const bitmap = source instanceof ImageBitmap ? source : await decodeBlob(source);
      try {
        return await runPipeline(bitmap, full, signal);
      } finally {
        bitmap.close();
      }
    }

    const worker = this.getWorker();
    const id = this.nextId++;
    return new Promise<PipelineResult>((resolve, reject) => {
      const cleanup = () => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        signal?.removeEventListener('abort', onAbort);
      };
      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== id) return;
        cleanup();
        if (event.data.ok) resolve(event.data.result);
        else reject(new Error(event.data.error));
      };
      const onError = () => {
        cleanup();
        this.terminate();
        reject(new Error('The image worker crashed — the image may be too large for this device.'));
      };
      const onAbort = () => {
        cleanup();
        this.terminate();
        reject(abortError());
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      signal?.addEventListener('abort', onAbort, { once: true });
      const request: WorkerRequest = { id, source, options: full };
      worker.postMessage(request, source instanceof ImageBitmap ? [source] : []);
    });
  }
}

export function defaultOutputFor(format: DetectedFormat): 'jpeg' | 'png' | 'webp' {
  if (format === 'png' || format === 'gif' || format === 'bmp') return 'png';
  if (format === 'webp') return 'webp';
  return 'jpeg';
}

export function extensionFor(format: 'jpeg' | 'png' | 'webp'): string {
  return FORMAT_INFO[format].ext;
}
