import type { OutputFormat } from '../lib/format';
import type { Rect, ResizeSpec, Rotation } from '../lib/resize';

export interface OutputOptions {
  format: OutputFormat;
  /** 0–1. Ignored for lossless PNG. */
  quality: number;
  /** Fill colour for transparent areas (always used for JPEG). */
  background?: string;
  /** PNG only: 0 = lossless, 2–256 = reduce to a palette of this many colours. */
  pngColors?: number;
  /** WebP only: encode losslessly. */
  webpLossless?: boolean;
}

export interface PipelineOptions {
  /** Crop rectangle in the source image's (already EXIF-oriented) pixel space. */
  crop?: Rect;
  rotate?: Rotation;
  flipH?: boolean;
  flipV?: boolean;
  resize?: ResizeSpec;
  allowUpscale?: boolean;
  output: OutputOptions;
  /** When set, search quality/dimensions so the file is at most this many bytes. */
  targetBytes?: number;
  maxCanvasPixels: number;
  maxCanvasSide: number;
}

/** A translatable message produced in the worker (translated on the main thread). */
export interface Note {
  key: string;
  params?: Record<string, string | number>;
}

export interface PipelineResult {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
  quality?: number;
  /** Only for target-size jobs. */
  fitsTarget?: boolean;
  notes: Note[];
}

export type WorkerRequest = {
  id: number;
  source: Blob | ImageBitmap;
  options: PipelineOptions;
};

export type WorkerResponse =
  | { id: number; ok: true; result: PipelineResult }
  | { id: number; ok: false; error: string };
