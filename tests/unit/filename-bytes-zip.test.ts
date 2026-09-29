import { unzipSync } from 'fflate';
import { describeChange, formatBytes, kbToSafeBytes, percentChange } from '../../src/lib/bytes';
import { baseName, outputName, sanitizeBaseName, uniqueNames } from '../../src/lib/filename';
import { buildZip } from '../../src/lib/zip';

describe('filename safety', () => {
  it('strips directories and extensions', () => {
    expect(baseName('../../etc/passwd.jpg')).toBe('passwd');
    expect(baseName('C:\\Users\\me\\photo.final.png')).toBe('photo.final');
    expect(baseName('.hidden')).toBe('.hidden');
  });

  it('removes traversal, illegal and invisible characters', () => {
    expect(sanitizeBaseName('../../evil.jpg')).toBe('evil');
    expect(sanitizeBaseName('a<b>c:d"e|f?g*h.png')).toBe('a_b_c_d_e_f_g_h');
    expect(sanitizeBaseName('invoice\u202Egpj.exe')).toBe('invoicegpj');
    expect(sanitizeBaseName('line\nbreak\ttab.jpg')).toBe('linebreaktab');
    expect(sanitizeBaseName('...')).toBe('image');
    expect(sanitizeBaseName('')).toBe('image');
    expect(sanitizeBaseName('   .jpg')).toBe('image');
  });

  it('keeps unicode names and handles reserved Windows names', () => {
    expect(sanitizeBaseName('写真 2024年.heic')).toBe('写真 2024年');
    expect(sanitizeBaseName('CON.jpg')).toBe('CON_file');
    // '/' is a path separator, so only the last segment survives.
    expect(sanitizeBaseName('<script>alert(1)</script>.png')).toBe('script_');
    expect(sanitizeBaseName('<img src=x onerror=alert(1)>.png')).toBe('_img src=x onerror=alert(1)_');
  });

  it('truncates very long names without splitting emoji', () => {
    const long = '😀'.repeat(150) + '.jpg';
    const out = sanitizeBaseName(long);
    expect(Array.from(out).length).toBe(100);
    expect(out).not.toMatch(/\uFFFD/);
  });

  it('always uses our own extension', () => {
    expect(outputName('photo.exe', 'jpg')).toBe('photo.jpg');
    expect(outputName('photo.jpg.exe', 'png', 'resized')).toBe('photo.jpg-resized.png');
    expect(outputName('x.png', 'j/p\\g')).toBe('x.jpg');
  });

  it('deduplicates names case-insensitively', () => {
    expect(uniqueNames(['a.jpg', 'A.jpg', 'a.jpg', 'b.png'])).toEqual(['a.jpg', 'A (2).jpg', 'a (3).jpg', 'b.png']);
    expect(uniqueNames(['a.jpg', 'a (2).jpg', 'a.jpg'])).toEqual(['a.jpg', 'a (2).jpg', 'a (3).jpg']);
  });
});

describe('byte helpers', () => {
  it('formats sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1536000)).toBe('1.46 MB');
    expect(formatBytes(-1)).toBe('—');
  });

  it('computes percentage changes', () => {
    expect(percentChange(1000, 580)).toBe(-42);
    expect(percentChange(1000, 1500)).toBe(50);
    expect(percentChange(0, 10)).toBe(0);
    expect(describeChange(1000, 250)).toBe('75% smaller');
    expect(describeChange(1000, 1100)).toBe('10% larger');
  });

  it('uses the stricter 1 KB = 1000 bytes budget for size targets', () => {
    expect(kbToSafeBytes(100)).toBe(100000);
    expect(kbToSafeBytes(19.5)).toBe(19500);
    expect(kbToSafeBytes(0)).toBeNull();
    expect(kbToSafeBytes(Number.NaN)).toBeNull();
  });
});

describe('buildZip', () => {
  it('creates a flat archive with unique, path-free names', () => {
    const zip = buildZip([
      { name: 'a.jpg', data: new Uint8Array([1, 2, 3]) },
      { name: 'a.jpg', data: new Uint8Array([4]) },
      { name: '../x.png', data: new Uint8Array([5]) },
    ]);
    const files = unzipSync(zip);
    expect(Object.keys(files).sort()).toEqual(['.._x.png', 'a (2).jpg', 'a.jpg']);
    expect(Array.from(files['a.jpg'])).toEqual([1, 2, 3]);
  });
});
