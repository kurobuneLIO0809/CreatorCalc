import sharp from 'sharp';
import { readDimensions, sniffFormat } from '../../src/lib/format';
import { rgbRaw } from './fixtures';

const enc = (s: string) => new TextEncoder().encode(s);

describe('sniffFormat', () => {
  it('detects real encoded images regardless of name', async () => {
    const base = await rgbRaw(20, 10);
    expect(sniffFormat(new Uint8Array(await base.clone().jpeg().toBuffer()))).toBe('jpeg');
    expect(sniffFormat(new Uint8Array(await base.clone().png().toBuffer()))).toBe('png');
    expect(sniffFormat(new Uint8Array(await base.clone().webp().toBuffer()))).toBe('webp');
    expect(sniffFormat(new Uint8Array(await base.clone().gif().toBuffer()))).toBe('gif');
    expect(sniffFormat(new Uint8Array(await base.clone().tiff().toBuffer()))).toBe('tiff');
    expect(sniffFormat(new Uint8Array(await base.clone().avif().toBuffer()))).toBe('avif');
  });

  it('detects HEIC ftyp brands and keeps AVIF separate', () => {
    const ftyp = (major: string, ...compat: string[]) => {
      const brands = [major, '\0\0\0\0', ...compat].join('');
      const size = 8 + brands.length;
      const b = new Uint8Array(size + 16);
      new DataView(b.buffer).setUint32(0, size);
      b.set(enc('ftyp'), 4);
      b.set(enc(brands), 8);
      return b;
    };
    expect(sniffFormat(ftyp('heic', 'mif1', 'heic'))).toBe('heic');
    expect(sniffFormat(ftyp('mif1', 'mif1', 'heic'))).toBe('heic');
    expect(sniffFormat(ftyp('mif1', 'mif1', 'avif'))).toBe('avif');
    expect(sniffFormat(ftyp('avif', 'mif1'))).toBe('avif');
    expect(sniffFormat(ftyp('isom', 'mp41'))).toBe('unknown');
  });

  it('flags SVG, PDF and spoofed/garbage content', () => {
    expect(sniffFormat(enc('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBe('svg');
    expect(sniffFormat(enc('﻿  <svg onload="x">'))).toBe('svg');
    expect(sniffFormat(enc('%PDF-1.7\n'))).toBe('pdf');
    expect(sniffFormat(enc('MZ\x90\x00 this is an exe renamed to .jpg'))).toBe('unknown');
    expect(sniffFormat(enc('<html><body>not an image</body></html>'))).toBe('unknown');
    expect(sniffFormat(new Uint8Array([]))).toBe('unknown');
    expect(sniffFormat(new Uint8Array([0xff, 0xd8]))).toBe('unknown');
  });
});

describe('readDimensions', () => {
  it('reads dimensions from headers of common formats', async () => {
    const base = await rgbRaw(123, 45);
    for (const fmt of ['jpeg', 'png', 'webp', 'gif'] as const) {
      const bytes = new Uint8Array(await base.clone().toFormat(fmt).toBuffer());
      expect(readDimensions(bytes), fmt).toEqual({ width: 123, height: 45 });
    }
    const lossless = new Uint8Array(await base.clone().webp({ lossless: true }).toBuffer());
    expect(readDimensions(lossless)).toEqual({ width: 123, height: 45 });
    const alpha = new Uint8Array(await (await rgbRaw(77, 33, true)).webp().toBuffer());
    expect(readDimensions(alpha)).toEqual({ width: 77, height: 33 });
  });

  it('reads JPEG dimensions after a large EXIF block', async () => {
    const big = await sharp({ create: { width: 300, height: 200, channels: 3, background: '#808080' } })
      .jpeg()
      .withExif({ IFD0: { ImageDescription: 'x'.repeat(20000) } })
      .toBuffer();
    expect(readDimensions(new Uint8Array(big))).toEqual({ width: 300, height: 200 });
  });

  it('exposes decompression-bomb dimensions from a tiny PNG header', () => {
    const b = new Uint8Array(33);
    b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
    b.set(enc('IHDR'), 12);
    new DataView(b.buffer).setUint32(16, 100000);
    new DataView(b.buffer).setUint32(20, 100000);
    expect(readDimensions(b)).toEqual({ width: 100000, height: 100000 });
  });

  it('reads AVIF/HEIF dimensions from the ispe box', async () => {
    const avif = new Uint8Array(await (await rgbRaw(321, 123)).avif().toBuffer());
    expect(readDimensions(avif)).toEqual({ width: 321, height: 123 });
    // Bomb check also works for HEIF: a forged ispe claiming 60000 × 60000.
    const forged = avif.slice();
    const i = Buffer.from(forged).indexOf('ispe');
    new DataView(forged.buffer).setUint32(i + 8, 60000);
    new DataView(forged.buffer).setUint32(i + 12, 60000);
    expect(readDimensions(forged)).toEqual({ width: 60000, height: 60000 });
  });

  it('returns null for truncated input instead of throwing', () => {
    expect(readDimensions(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toBeNull();
    expect(readDimensions(enc('RIFF\0\0\0\0WEBPVP8 '))).toBeNull();
  });
});
