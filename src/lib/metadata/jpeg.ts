/**
 * Lossless JPEG metadata removal: segments are dropped, compressed image data is copied
 * byte-for-byte, so there is no re-encoding and no quality loss.
 *
 * Removed: APP1 (EXIF incl. GPS, XMP), APP3–APP13 (e.g. IPTC/Photoshop), APP15, COM,
 * MPF (APP2) and any data after the End-Of-Image marker (embedded previews, depth/gain maps).
 * Kept: APP0 (JFIF), APP14 (Adobe colour transform — needed to decode CMYK files),
 * all coding segments, and optionally the ICC colour profile (APP2 ICC_PROFILE).
 * Optionally a minimal EXIF block containing only the Orientation tag is written back
 * so photos keep displaying upright.
 */

export interface StripOptions {
  keepIcc?: boolean;
  keepOrientation?: boolean;
}

export interface StripResult {
  bytes: Uint8Array;
  removed: string[];
}

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;

function startsWithAscii(b: Uint8Array, offset: number, text: string): boolean {
  if (offset + text.length > b.length) return false;
  for (let i = 0; i < text.length; i++) if (b[offset + i] !== text.charCodeAt(i)) return false;
  return true;
}

function describeApp(marker: number, b: Uint8Array, dataStart: number): string {
  if (marker === 0xe1) {
    if (startsWithAscii(b, dataStart, 'Exif\0')) return 'EXIF (camera, date, GPS location…)';
    if (startsWithAscii(b, dataStart, 'http://ns.adobe.com/xap/1.0/')) return 'XMP metadata';
    if (startsWithAscii(b, dataStart, 'http://ns.adobe.com/xmp/extension/')) return 'Extended XMP metadata';
    return 'APP1 metadata';
  }
  if (marker === 0xe2) {
    if (startsWithAscii(b, dataStart, 'ICC_PROFILE\0')) return 'ICC colour profile';
    if (startsWithAscii(b, dataStart, 'MPF\0')) return 'Multi-picture index (MPF)';
    return 'APP2 metadata';
  }
  if (marker === 0xed) return 'IPTC / Photoshop metadata';
  if (marker === 0xfe) return 'JPEG comment';
  return `APP${marker - 0xe0} metadata`;
}

/** Reads the EXIF Orientation tag (1–8) from a JPEG, or returns 1 when absent/invalid. */
export function readJpegOrientation(b: Uint8Array): number {
  if (b[0] !== 0xff || b[1] !== SOI) return 1;
  let o = 2;
  while (o + 4 <= b.length) {
    if (b[o] !== 0xff) return 1;
    const marker = b[o + 1];
    if (marker === 0xff) {
      o += 1;
      continue;
    }
    if (marker === SOS || marker === EOI) return 1;
    const len = (b[o + 2] << 8) | b[o + 3];
    if (len < 2 || o + 2 + len > b.length) return 1;
    if (marker === 0xe1 && startsWithAscii(b, o + 4, 'Exif\0\0')) {
      return parseTiffOrientation(b, o + 10, o + 2 + len);
    }
    o += 2 + len;
  }
  return 1;
}

function parseTiffOrientation(b: Uint8Array, tiff: number, end: number): number {
  if (tiff + 8 > end) return 1;
  const le = b[tiff] === 0x49 && b[tiff + 1] === 0x49;
  const be = b[tiff] === 0x4d && b[tiff + 1] === 0x4d;
  if (!le && !be) return 1;
  const u16 = (o: number) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o: number) =>
    (le ? b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24) : (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > end) return 1;
  const count = u16(ifd);
  for (let i = 0; i < count; i++) {
    const entry = ifd + 2 + i * 12;
    if (entry + 12 > end) return 1;
    if (u16(entry) === 0x0112) {
      const value = u16(entry + 8);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

/** A 34-byte APP1 segment holding a big-endian TIFF IFD with only the Orientation tag. */
export function minimalOrientationExif(orientation: number): Uint8Array {
  return new Uint8Array([
    0xff, 0xe1, 0x00, 0x22, // APP1, length 34
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08, // TIFF header (MM), IFD0 at 8
    0x00, 0x01, // 1 entry
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, orientation >> 8, orientation & 0xff, 0x00, 0x00, // Orientation SHORT
    0x00, 0x00, 0x00, 0x00, // no next IFD
  ]);
}

export function stripJpegMetadata(b: Uint8Array, options: StripOptions = {}): StripResult {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== SOI) throw new Error('Not a valid JPEG file');
  const keepIcc = options.keepIcc ?? true;
  const orientation = options.keepOrientation ? readJpegOrientation(b) : 1;
  const chunks: Uint8Array[] = [b.subarray(0, 2)];
  const removed = new Set<string>();
  let insertedOrientation = false;
  let o = 2;
  let sawSos = false;

  const maybeInsertOrientation = () => {
    if (!insertedOrientation && orientation !== 1) {
      chunks.push(minimalOrientationExif(orientation));
      insertedOrientation = true;
    }
  };

  while (o < b.length) {
    if (b[o] !== 0xff || (sawSos && b[o + 1] === 0x00)) {
      // Entropy-coded data after SOS: copy until the next real marker.
      if (!sawSos) throw new Error('Corrupted JPEG structure');
      const start = o;
      while (o < b.length) {
        if (b[o] === 0xff && o + 1 < b.length) {
          const next = b[o + 1];
          if (next === 0x00 || (next >= 0xd0 && next <= 0xd7) || next === 0xff) {
            o += next === 0xff ? 1 : 2;
            continue;
          }
          break;
        }
        o += 1;
      }
      chunks.push(b.subarray(start, o));
      continue;
    }
    const marker = b[o + 1];
    if (marker === undefined) break;
    if (marker === 0xff) {
      o += 1;
      continue;
    }
    if (marker === EOI) {
      chunks.push(b.subarray(o, o + 2));
      o += 2;
      if (o < b.length) removed.add('Data after end of image (embedded previews, depth or gain maps)');
      break;
    }
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      chunks.push(b.subarray(o, o + 2));
      o += 2;
      continue;
    }
    if (o + 4 > b.length) throw new Error('Truncated JPEG file');
    const len = (b[o + 2] << 8) | b[o + 3];
    const end = o + 2 + len;
    if (len < 2 || end > b.length) throw new Error('Truncated JPEG file');
    const isApp = marker >= 0xe0 && marker <= 0xef;
    let keep = true;
    if (isApp || marker === 0xfe) {
      if (marker === 0xe0 || marker === 0xee) keep = true;
      else if (marker === 0xe2 && startsWithAscii(b, o + 4, 'ICC_PROFILE\0')) keep = keepIcc;
      else keep = false;
      if (!keep) removed.add(describeApp(marker, b, o + 4));
    }
    // The Orientation block goes right after SOI/APP0, before any other segment.
    if (marker !== 0xe0 && !sawSos) maybeInsertOrientation();
    if (keep) chunks.push(b.subarray(o, end));
    if (marker === SOS) sawSos = true;
    o = end;
  }

  if (!sawSos) throw new Error('JPEG has no image data');
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return { bytes: out, removed: [...removed] };
}
