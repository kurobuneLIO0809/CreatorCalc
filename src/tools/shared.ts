import { features } from '../config/site';
import { FORMAT_INFO, formatLabel, type DetectedFormat, type OutputFormat } from '../lib/format';
import { outputName } from '../lib/filename';
import type { ItemResult } from '../components/tool-ui/useBatch';
import type { PipelineResult } from '../services/types';

const HEIC = features.heicDecoder;
export const RASTER_INPUTS: readonly DetectedFormat[] = ['jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', ...(HEIC ? (['heic'] as const) : [])];
export const RASTER_ACCEPT_ATTR = HEIC ? 'image/*,.heic,.heif,.avif' : 'image/*,.avif';
export const RASTER_HINT = HEIC ? 'JPG, PNG, WebP, HEIC, AVIF, GIF, BMP' : 'JPG, PNG, WebP, AVIF, GIF, BMP';

export const OUTPUT_OPTIONS: Array<{ value: OutputFormat; label: string }> = [
  { value: 'jpeg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

export function toItemResult(file: File, result: PipelineResult, suffix = ''): Omit<ItemResult, 'url'> {
  return {
    blob: result.blob,
    name: outputName(file.name, FORMAT_INFO[result.format].ext, suffix),
    width: result.width,
    height: result.height,
    notes: result.notes,
  };
}

/** Returns the untouched original file as the result. */
export function keepOriginal(file: File, format: DetectedFormat, note: string, extra: Partial<ItemResult> = {}): Omit<ItemResult, 'url'> {
  const ext = format === 'unknown' ? 'bin' : FORMAT_INFO[format].ext;
  return { blob: file, name: outputName(file.name, ext), notes: [note], keptOriginal: true, ...extra };
}

export function animationNote(format: DetectedFormat | undefined, animated: boolean | undefined): string[] {
  return animated ? [`Animated ${formatLabel(format ?? 'unknown')}: only the first frame was used.`] : [];
}

export const sameFormatMessage = (format: DetectedFormat) => `This file is already a ${formatLabel(format)} — it does not need converting.`;
