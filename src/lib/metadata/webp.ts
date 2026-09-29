/**
 * Lossless WebP metadata removal: EXIF and XMP chunks are dropped from the RIFF
 * container, the VP8X feature flags and RIFF size are updated. Image data is untouched.
 */
import type { StripResult } from './jpeg';

const FLAG_ICC = 0x20;
const FLAG_EXIF = 0x08;
const FLAG_XMP = 0x04;

export function stripWebpMetadata(b: Uint8Array, options: { keepIcc?: boolean } = {}): StripResult {
  const keepIcc = options.keepIcc ?? true;
  const tag = (o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
  if (b.length < 20 || tag(0) !== 'RIFF' || tag(8) !== 'WEBP') throw new Error('Not a valid WebP file');
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const riffEnd = Math.min(b.length, 8 + view.getUint32(4, true));
  const chunks: Uint8Array[] = [];
  const removed = new Set<string>();
  let vp8xIndex = -1;
  let o = 12;
  while (o + 8 <= riffEnd) {
    const type = tag(o);
    const size = view.getUint32(o + 4, true);
    const end = o + 8 + size + (size & 1);
    if (o + 8 + size > riffEnd) throw new Error('Truncated WebP file');
    let keep = true;
    if (type === 'EXIF') {
      keep = false;
      removed.add('EXIF (camera, date, GPS location…)');
    } else if (type === 'XMP ') {
      keep = false;
      removed.add('XMP metadata');
    } else if (type === 'ICCP' && !keepIcc) {
      keep = false;
      removed.add('ICC colour profile');
    }
    if (keep) {
      if (type === 'VP8X') vp8xIndex = chunks.length;
      chunks.push(b.slice(o, Math.min(end, riffEnd)));
    }
    o = end;
  }
  if (b.length > riffEnd) removed.add('Data after end of image');
  if (vp8xIndex >= 0) {
    const vp8x = chunks[vp8xIndex];
    let flags = vp8x[8] & ~(FLAG_EXIF | FLAG_XMP);
    if (!keepIcc) flags &= ~FLAG_ICC;
    vp8x[8] = flags;
  }
  const payload = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(12 + payload);
  out.set(b.subarray(0, 12), 0);
  new DataView(out.buffer).setUint32(4, 4 + payload, true);
  let p = 12;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return { bytes: out, removed: [...removed] };
}
