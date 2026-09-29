/**
 * Lossless PNG metadata removal. Chunks are copied unchanged (CRCs stay valid);
 * text, EXIF and timestamp chunks are dropped, as is anything after IEND.
 */
import type { StripResult } from './jpeg';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Ancillary chunks needed for correct display (colour, transparency, animation). */
const KEEP_ANCILLARY = new Set(['tRNS', 'gAMA', 'cHRM', 'sRGB', 'sBIT', 'bKGD', 'pHYs', 'hIST', 'sPLT', 'acTL', 'fcTL', 'fdAT', 'cICP', 'mDCv', 'cLLi']);

const DESCRIPTIONS: Record<string, string> = {
  tEXt: 'Text metadata (tEXt)',
  zTXt: 'Compressed text metadata (zTXt)',
  iTXt: 'International text / XMP (iTXt)',
  eXIf: 'EXIF (camera, date, GPS location…)',
  tIME: 'Last-modified timestamp (tIME)',
  iCCP: 'ICC colour profile',
};

export function stripPngMetadata(b: Uint8Array, options: { keepIcc?: boolean } = {}): StripResult {
  const keepIcc = options.keepIcc ?? true;
  if (b.length < 8 || SIGNATURE.some((v, i) => b[i] !== v)) throw new Error('Not a valid PNG file');
  const chunks: Uint8Array[] = [b.subarray(0, 8)];
  const removed = new Set<string>();
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let o = 8;
  let sawIend = false;
  while (o + 12 <= b.length) {
    const len = view.getUint32(o);
    const type = String.fromCharCode(b[o + 4], b[o + 5], b[o + 6], b[o + 7]);
    const end = o + 12 + len;
    if (end > b.length) throw new Error('Truncated PNG file');
    const critical = (b[o + 4] & 0x20) === 0;
    let keep = critical || KEEP_ANCILLARY.has(type) || (type === 'iCCP' && keepIcc);
    if (type === 'CgBI') throw new Error('Apple-optimised PNGs (CgBI) are not supported');
    if (!keep) removed.add(DESCRIPTIONS[type] ?? `Private chunk (${type.replace(/[^A-Za-z]/g, '?')})`);
    if (keep) chunks.push(b.subarray(o, end));
    o = end;
    if (type === 'IEND') {
      sawIend = true;
      break;
    }
  }
  if (!sawIend) throw new Error('PNG is missing its end marker');
  if (o < b.length) removed.add('Data after end of image');
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return { bytes: out, removed: [...removed] };
}
