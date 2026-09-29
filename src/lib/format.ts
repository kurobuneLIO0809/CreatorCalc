/**
 * File-format detection from magic bytes. Extensions and the browser-provided MIME
 * type are never trusted: a renamed or spoofed file is identified by its content.
 */

export type DetectedFormat =
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'bmp'
  | 'avif'
  | 'heic'
  | 'tiff'
  | 'ico'
  | 'svg'
  | 'pdf'
  | 'unknown';

/** Formats our tools can write. */
export type OutputFormat = 'jpeg' | 'png' | 'webp';

export interface FormatInfo {
  label: string;
  mime: string;
  ext: string;
}

export const FORMAT_INFO: Record<Exclude<DetectedFormat, 'unknown'>, FormatInfo> = {
  jpeg: { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  png: { label: 'PNG', mime: 'image/png', ext: 'png' },
  webp: { label: 'WebP', mime: 'image/webp', ext: 'webp' },
  gif: { label: 'GIF', mime: 'image/gif', ext: 'gif' },
  bmp: { label: 'BMP', mime: 'image/bmp', ext: 'bmp' },
  avif: { label: 'AVIF', mime: 'image/avif', ext: 'avif' },
  heic: { label: 'HEIC', mime: 'image/heic', ext: 'heic' },
  tiff: { label: 'TIFF', mime: 'image/tiff', ext: 'tiff' },
  ico: { label: 'ICO', mime: 'image/x-icon', ext: 'ico' },
  svg: { label: 'SVG', mime: 'image/svg+xml', ext: 'svg' },
  pdf: { label: 'PDF', mime: 'application/pdf', ext: 'pdf' },
};

export function formatLabel(format: DetectedFormat): string {
  return format === 'unknown' ? 'Unknown' : FORMAT_INFO[format].label;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = '';
  for (let i = start; i < start + length && i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

const HEIF_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1', 'mif2']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

/** Reads the ISO-BMFF `ftyp` box and classifies it as AVIF or HEIC. */
function classifyFtyp(bytes: Uint8Array): DetectedFormat {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== 'ftyp') return 'unknown';
  const boxSize = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  const end = Math.min(bytes.length, boxSize >= 16 ? boxSize : 16);
  const brands = [ascii(bytes, 8, 4)];
  for (let off = 16; off + 4 <= end; off += 4) brands.push(ascii(bytes, off, 4));
  if (brands.some((b) => AVIF_BRANDS.has(b))) return 'avif';
  if (brands.some((b) => HEIF_BRANDS.has(b))) return 'heic';
  return 'unknown';
}

/** Detects the real format of a file from its first bytes (>= 64 bytes recommended). */
export function sniffFormat(bytes: Uint8Array): DetectedFormat {
  if (bytes.length < 4) return 'unknown';
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b[0] === 0x89 && ascii(b, 1, 3) === 'PNG' && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a)
    return 'png';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'webp';
  if (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a') return 'gif';
  if (b[0] === 0x42 && b[1] === 0x4d && b.length >= 26) return 'bmp';
  if (ascii(b, 4, 4) === 'ftyp') return classifyFtyp(b);
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0 && b[3] === 0x2a))
    return 'tiff';
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'ico';
  if (ascii(b, 0, 5) === '%PDF-') return 'pdf';
  // SVG / XML: look for "<svg" near the start of a text document.
  const head = new TextDecoder('utf-8', { fatal: false }).decode(b.subarray(0, Math.min(b.length, 1024))).replace(/^﻿/, '').trimStart();
  if (head.startsWith('<') && /<svg[\s>]/i.test(head)) return 'svg';
  return 'unknown';
}

export interface Dimensions {
  width: number;
  height: number;
}

function u16be(b: Uint8Array, o: number): number {
  return (b[o] << 8) | b[o + 1];
}
function u16le(b: Uint8Array, o: number): number {
  return b[o] | (b[o + 1] << 8);
}
function u32be(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}
function u24le(b: Uint8Array, o: number): number {
  return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
}
function i32le(b: Uint8Array, o: number): number {
  return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24);
}

function jpegDimensions(b: Uint8Array): Dimensions | null {
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) return null;
    const marker = b[o + 1];
    if (marker === 0xff) {
      o += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      o += 2;
      continue;
    }
    const len = u16be(b, o + 2);
    if (len < 2) return null;
    // SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = u16be(b, o + 5);
      const width = u16be(b, o + 7);
      return width > 0 && height > 0 ? { width, height } : null;
    }
    if (marker === 0xda || marker === 0xd9) return null;
    o += 2 + len;
  }
  return null;
}

function webpDimensions(b: Uint8Array): Dimensions | null {
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8X' && b.length >= 30) {
    return { width: u24le(b, 24) + 1, height: u24le(b, 27) + 1 };
  }
  if (chunk === 'VP8 ' && b.length >= 30) {
    return { width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
  }
  if (chunk === 'VP8L' && b.length >= 25) {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  return null;
}

/**
 * Reads pixel dimensions from the file header without decoding the image.
 * Used to reject decompression bombs before the browser allocates memory.
 * Returns null when the format has no cheap header parser (HEIC, AVIF, TIFF…).
 */
export function readDimensions(bytes: Uint8Array, format: DetectedFormat = sniffFormat(bytes)): Dimensions | null {
  const b = bytes;
  switch (format) {
    case 'png':
      if (b.length >= 24 && ascii(b, 12, 4) === 'IHDR') return { width: u32be(b, 16), height: u32be(b, 20) };
      return null;
    case 'gif':
      if (b.length >= 10) return { width: u16le(b, 6), height: u16le(b, 8) };
      return null;
    case 'bmp':
      if (b.length >= 26) return { width: Math.abs(i32le(b, 18)), height: Math.abs(i32le(b, 22)) };
      return null;
    case 'jpeg':
      return jpegDimensions(b);
    case 'webp':
      return webpDimensions(b);
    default:
      return null;
  }
}
