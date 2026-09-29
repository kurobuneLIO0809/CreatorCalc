import exifr from 'exifr';
import sharp from 'sharp';
import { minimalOrientationExif, readJpegOrientation, stripJpegMetadata } from '../../src/lib/metadata/jpeg';
import { stripPngMetadata } from '../../src/lib/metadata/png';
import { stripWebpMetadata } from '../../src/lib/metadata/webp';
import { jpegWithGps, pngWithText, rawPixels, webpWithExif } from './fixtures';

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};

describe('JPEG metadata removal', () => {
  it('removes EXIF/GPS losslessly', async () => {
    const input = await jpegWithGps();
    const before = await exifr.parse(Buffer.from(input), { gps: true });
    expect(before?.Make).toBe('TestCam');
    expect(before?.latitude).toBeCloseTo(35.683, 2);

    const { bytes, removed } = stripJpegMetadata(input, { keepOrientation: false });
    expect(removed.some((r) => r.startsWith('EXIF'))).toBe(true);
    expect(bytes.length).toBeLessThan(input.length);
    expect(await exifr.parse(Buffer.from(bytes), { gps: true })).toBeUndefined();

    // Pixel data is bit-identical (no re-encoding).
    const [a, b] = await Promise.all([rawPixels(input), rawPixels(bytes)]);
    expect(Buffer.compare(a.data, b.data)).toBe(0);
  });

  it('can keep only the orientation tag', async () => {
    const input = await jpegWithGps();
    expect(readJpegOrientation(input)).toBe(6);
    const { bytes } = stripJpegMetadata(input, { keepOrientation: true });
    expect(readJpegOrientation(bytes)).toBe(6);
    const parsed = await exifr.parse(Buffer.from(bytes), { gps: true, translateValues: false });
    expect(parsed?.Orientation).toBe(6);
    expect(parsed?.Make).toBeUndefined();
    expect(parsed?.latitude).toBeUndefined();
    const meta = await sharp(Buffer.from(bytes)).metadata();
    expect(meta.orientation).toBe(6);
    expect(meta.format).toBe('jpeg');
  });

  it('drops trailing data after EOI (e.g. appended secret payloads)', async () => {
    const input = await jpegWithGps();
    const withTrailer = concat(input, new TextEncoder().encode('SECRET-TRAILER'));
    const { bytes, removed } = stripJpegMetadata(withTrailer);
    expect(removed.some((r) => r.includes('after end of image'))).toBe(true);
    expect(new TextDecoder().decode(bytes)).not.toContain('SECRET-TRAILER');
  });

  it('drops comments and keeps the ICC profile when asked', async () => {
    const buf = await sharp({ create: { width: 16, height: 16, channels: 3, background: '#ff0000' } })
      .jpeg()
      .withIccProfile('p3')
      .toBuffer();
    const input = new Uint8Array(buf);
    // Insert a COM segment right after SOI.
    const comment = new TextEncoder().encode('private note');
    const com = concat(new Uint8Array([0xff, 0xfe, 0, comment.length + 2]), comment);
    const withCom = concat(input.subarray(0, 2), com, input.subarray(2));
    const kept = stripJpegMetadata(withCom, { keepIcc: true });
    expect(kept.removed).toContain('JPEG comment');
    expect((await sharp(Buffer.from(kept.bytes)).metadata()).icc).toBeDefined();
    const dropped = stripJpegMetadata(withCom, { keepIcc: false });
    expect(dropped.removed).toContain('ICC colour profile');
    expect((await sharp(Buffer.from(dropped.bytes)).metadata()).icc).toBeUndefined();
  });

  it('handles progressive JPEGs', async () => {
    const buf = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#3366cc' } })
      .jpeg({ progressive: true })
      .withExif({ IFD0: { Make: 'X' } })
      .toBuffer();
    const { bytes } = stripJpegMetadata(new Uint8Array(buf));
    const [a, b] = await Promise.all([rawPixels(new Uint8Array(buf)), rawPixels(bytes)]);
    expect(Buffer.compare(a.data, b.data)).toBe(0);
  });

  it('rejects non-JPEG and truncated input', async () => {
    expect(() => stripJpegMetadata(new Uint8Array([1, 2, 3, 4]))).toThrow();
    const input = await jpegWithGps();
    expect(() => stripJpegMetadata(input.subarray(0, 30))).toThrow();
  });

  it('builds a valid minimal orientation block', () => {
    const seg = minimalOrientationExif(8);
    expect(seg.length).toBe(36);
    expect(readJpegOrientation(concat(new Uint8Array([0xff, 0xd8]), seg, new Uint8Array([0xff, 0xd9])))).toBe(8);
  });
});

describe('PNG metadata removal', () => {
  it('removes text/EXIF chunks and keeps pixels identical', async () => {
    const input = await pngWithText();
    const text = new TextDecoder('latin1').decode(input);
    expect(text).toMatch(/eXIf|tEXt|iTXt|zTXt/);
    const { bytes, removed } = stripPngMetadata(input);
    expect(removed.length).toBeGreaterThan(0);
    const out = new TextDecoder('latin1').decode(bytes);
    expect(out).not.toMatch(/eXIf|tEXt|iTXt|zTXt/);
    const [a, b] = await Promise.all([rawPixels(input), rawPixels(bytes)]);
    expect(Buffer.compare(a.data, b.data)).toBe(0);
    expect(a.info.channels).toBe(4);
  });

  it('rejects broken files', async () => {
    const input = await pngWithText();
    expect(() => stripPngMetadata(input.subarray(0, input.length - 20))).toThrow();
    expect(() => stripPngMetadata(new Uint8Array(10))).toThrow();
  });
});

describe('WebP metadata removal', () => {
  it('removes EXIF, fixes VP8X flags and RIFF size', async () => {
    const input = await webpWithExif();
    expect(new TextDecoder('latin1').decode(input)).toContain('EXIF');
    const { bytes, removed } = stripWebpMetadata(input);
    expect(removed[0]).toMatch(/^EXIF/);
    expect(new TextDecoder('latin1').decode(bytes)).not.toContain('EXIF');
    const view = new DataView(bytes.buffer, bytes.byteOffset);
    expect(view.getUint32(4, true)).toBe(bytes.length - 8);
    const meta = await sharp(Buffer.from(bytes)).metadata();
    expect(meta.exif).toBeUndefined();
    const [a, b] = await Promise.all([rawPixels(input), rawPixels(bytes)]);
    expect(Buffer.compare(a.data, b.data)).toBe(0);
  });
});
