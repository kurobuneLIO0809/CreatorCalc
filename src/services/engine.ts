/**
 * Main-thread entry point for image processing: validates inputs before decoding, decodes
 * HEIC when needed, and runs the pipeline in a Web Worker (cancellable) or on the main
 * thread as a fallback. Nothing here performs network requests with user data.
 */
import { features, limits } from '../config/site';
import { num, t } from '../i18n/runtime';
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

declare const __HEIC_DECODER__: boolean;


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
  if (file.size === 0) throw new InputError(t('err.empty'));
  if (file.size > limits.maxFileBytes) {
    throw new InputError(t('err.fileTooLarge', { mb: Math.round(limits.maxFileBytes / 1024 / 1024) }));
  }
  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
  } catch {
    throw new InputError(t('err.unreadable'));
  }
  const format = sniffFormat(head);
  if (format === 'svg') throw new InputError(t('err.svg'));
  if (format === 'pdf') throw new InputError(t('err.pdf'));
  if (format === 'unknown') throw new InputError(t('err.unknown'));
  if (!accept.includes(format)) {
    if (format === 'heic' && !features.heicDecoder) throw new InputError(t('err.heicUnsupported'));
    throw new InputError(t('err.unsupportedFormat', { format: formatLabel(format) }), format);
  }
  const dims = readDimensions(head, format);
  if (dims) {
    if (dims.width === 0 || dims.height === 0) throw new InputError(t('err.zeroPx'));
    if (dims.width * dims.height > maxDecodePixels()) {
      throw new InputError(t('err.tooManyPixels', { w: num(dims.width), h: num(dims.height), mp: Math.round(maxDecodePixels() / 1e6) }));
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
  if (!__HEIC_DECODER__) throw new InputError(t('err.heicUnsupported'));
  const { heicTo } = await import('heic-to/csp');
  try {
    return await heicTo({ blob: file, type: 'bitmap', options: { imageOrientation: 'from-image' } });
  } catch {
    throw new Error(t('err.heicDecode'));
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
      try {
        const bitmap = source instanceof ImageBitmap ? source : await decodeBlob(source);
        try {
          return await runPipeline(bitmap, full, signal);
        } finally {
          bitmap.close();
        }
      } catch (error) {
        // Pipeline errors carry message keys; translate them like worker errors.
        if (error instanceof Error && !isAbort(error)) throw new Error(t(error.message));
        throw error;
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
        else reject(new Error(t(event.data.error)));
      };
      const onError = () => {
        cleanup();
        this.terminate();
        reject(new Error(t('err.workerCrash')));
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
