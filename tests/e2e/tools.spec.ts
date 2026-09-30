import exifr from 'exifr';
import { existsSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { unzipSync } from 'fflate';
import { addFiles, download, expect, fx, gotoTool, resultRows, test, waitForAllDone } from './helpers';

const meta = (b: Buffer) => sharp(b).metadata();

test.describe('Image Compressor', () => {
  test('compresses a JPG, strips EXIF/GPS and the output opens', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    const row = resultRows(page).first();
    await expect(row).toContainText('smaller');
    const { name, bytes } = await download(page, row.getByRole('button', { name: 'Download' }));
    expect(name).toBe('photo-compressed.jpg');
    const m = await meta(bytes);
    expect(m.format).toBe('jpeg');
    expect([m.width, m.height]).toEqual([1600, 1200]);
    expect(await exifr.parse(bytes, { gps: true })).toBeUndefined();
  });

  test('re-runs automatically when settings change and converts to WebP', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    await page.getByRole('radio', { name: 'WebP', exact: true }).check();
    await expect(resultRows(page).first()).toContainText('photo-compressed.webp');
    await waitForAllDone(page, 1);
    const { bytes } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect((await meta(bytes)).format).toBe('webp');
  });

  test('PNG is quantized and keeps transparency; batch downloads as ZIP', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, 'graphic.png', 'small.png', 'image.webp');
    await waitForAllDone(page, 3);
    const { name, bytes } = await download(page, page.getByRole('button', { name: 'Download all (.zip)' }));
    expect(name).toBe('compressed-images.zip');
    const files = unzipSync(new Uint8Array(bytes));
    expect(Object.keys(files).sort()).toHaveLength(3);
    const png = Buffer.from(files['graphic-compressed.png'] ?? files['graphic.png']);
    const m = await meta(png);
    expect(m.format).toBe('png');
    expect(m.hasAlpha).toBe(true);
  });

  test('never returns a bigger file than the original', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    // tiny.jpg is 1×1 px — re-encoding cannot make it smaller.
    await addFiles(page, 'tiny.jpg');
    await waitForAllDone(page, 1);
    await expect(resultRows(page).first()).toContainText('original was kept unchanged');
  });

  test('rejects empty, fake, SVG, corrupt, bomb and unsupported files with clear messages', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, 'empty.jpg', 'fake.jpg', 'evil.svg', 'bomb.png', 'notes.txt', 'corrupt.jpg', 'image.gif');
    const rows = resultRows(page);
    await expect(rows).toHaveCount(7);
    await expect(rows.nth(0)).toContainText('This file is empty');
    await expect(rows.nth(1)).toContainText('not a supported image');
    await expect(rows.nth(2)).toContainText('SVG files are not supported');
    await expect(rows.nth(3)).toContainText('more than a browser can safely decode');
    await expect(rows.nth(4)).toContainText('not a supported image');
    await expect(rows.nth(5)).toContainText(/could not be decoded|damaged/, { timeout: 30_000 });
    await expect(rows.nth(6)).toContainText('GIF compression');
  });

  test('special characters in file names are sanitized in the download name', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, '写真 テスト <x>&"quote".jpg');
    await waitForAllDone(page, 1);
    const row = resultRows(page).first();
    // Displayed as text, never as HTML.
    await expect(row.locator('.result__name')).toHaveText(/写真 テスト _x_&_quote_-compressed\.jpg|写真 テスト <x>&"quote"\.jpg/);
    const { name } = await download(page, row.getByRole('button', { name: 'Download' }));
    expect(name).toBe('写真 テスト _x_&_quote_-compressed.jpg');
  });

  test('cancel stops a running batch and reset clears everything', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await page.getByLabel('Quality (JPG / WebP)').fill('90');
    await addFiles(page, 'large.jpg', 'large.jpg', 'large.jpg', 'large.jpg');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('.notice')).toContainText('Cancelled');
    expect(await page.locator('.result--done').count()).toBeLessThan(4);
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(resultRows(page)).toHaveCount(0);
    // The tool still works after cancelling (worker is recreated).
    await addFiles(page, 'small.png');
    await waitForAllDone(page, 1);
  });

  test('before/after comparison opens', async ({ page }) => {
    await gotoTool(page, '/tools/image-compressor');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    await resultRows(page).first().getByRole('button', { name: 'Compare' }).click();
    await expect(page.locator('.compare__frame img')).toHaveCount(2);
  });
});

test('main-thread fallback works without OffscreenCanvas (older Safari)', async ({ page }) => {
  await page.addInitScript(() => {
    // Simulate Safari < 16.4: no usable OffscreenCanvas, so no worker pipeline.
    Object.defineProperty(window, 'OffscreenCanvas', { value: undefined, configurable: true });
  });
  await gotoTool(page, '/tools/image-to-webp');
  await addFiles(page, 'photo.jpg', 'graphic.png');
  await waitForAllDone(page, 2);
  const { bytes } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
  expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
});

test.describe('Compress to exact KB', () => {
  test('hits a 100 KB budget', async ({ page }) => {
    await gotoTool(page, '/tools/compress-image-to-kb');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    const row = resultRows(page).first();
    await expect(row).toContainText('Fits the limit');
    const { bytes, name } = await download(page, row.getByRole('button', { name: 'Download' }));
    expect(name).toBe('photo-100kb.jpg');
    expect(bytes.length).toBeLessThanOrEqual(100_000);
    expect(bytes.length).toBeGreaterThan(50_000);
    expect((await meta(bytes)).format).toBe('jpeg');
  });

  test('reaches 20 KB on a large image by downscaling', async ({ page }) => {
    await gotoTool(page, '/tools/compress-image-to-kb');
    await page.getByRole('button', { name: '20 KB' }).click();
    await addFiles(page, 'large.jpg');
    await waitForAllDone(page, 1);
    const row = resultRows(page).first();
    await expect(row).toContainText('Fits the limit');
    await expect(row).toContainText('Dimensions reduced');
    const { bytes } = await download(page, row.getByRole('button', { name: 'Download' }));
    expect(bytes.length).toBeLessThanOrEqual(20_000);
  });

  test('custom value and invalid value', async ({ page }) => {
    await gotoTool(page, '/tools/compress-image-to-kb');
    await page.getByLabel('Or type your own limit').fill('2');
    await addFiles(page, 'photo.jpg');
    await expect(resultRows(page).first()).toContainText('at least 5 KB');
    await page.getByLabel('Or type your own limit').fill('300');
    await waitForAllDone(page, 1);
    const { bytes } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(bytes.length).toBeLessThanOrEqual(300_000);
  });
});

test.describe('Image Resizer', () => {
  test('resizes by width keeping aspect ratio', async ({ page }) => {
    await gotoTool(page, '/tools/image-resizer');
    await addFiles(page, 'photo.jpg', 'graphic.png');
    await page.getByLabel('Width').fill('800');
    await expect(page.locator('.tool__preview-size')).toContainText('800 × 600');
    await page.getByRole('button', { name: 'Resize 2 images' }).click();
    await waitForAllDone(page, 2);
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('photo-800x600.jpg');
    const m = await meta(bytes);
    expect([m.width, m.height]).toEqual([800, 600]);
    const png = await download(page, resultRows(page).nth(1).getByRole('button', { name: 'Download' }));
    expect((await meta(png.bytes)).format).toBe('png');
  });

  test('resizes by percentage and does not upscale by default', async ({ page }) => {
    await gotoTool(page, '/tools/image-resizer');
    await addFiles(page, 'small.png');
    await page.getByRole('radio', { name: 'Percentage' }).check();
    await page.getByLabel('Scale').fill('200');
    await page.getByRole('button', { name: 'Resize image' }).click();
    await waitForAllDone(page, 1);
    await expect(resultRows(page).first()).toContainText('64 × 48 px');
  });

  test('requires dimensions before resizing', async ({ page }) => {
    await gotoTool(page, '/tools/image-resizer');
    await addFiles(page, 'small.png');
    await page.getByRole('button', { name: 'Resize image' }).click();
    await expect(resultRows(page).first()).toContainText('Enter a width and/or height first');
  });
});

test.describe('Converters', () => {
  test('WebP → JPG fills transparency with white', async ({ page }) => {
    await gotoTool(page, '/tools/webp-to-jpg');
    await addFiles(page, 'image.webp');
    await waitForAllDone(page, 1);
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('image.jpg');
    const { data, info } = await sharp(bytes).raw().toBuffer({ resolveWithObject: true });
    expect(info.channels).toBe(3);
    // Right half of the fixture is transparent → must be (near) white.
    const i = (10 * info.width + info.width - 5) * 3;
    expect(data[i]).toBeGreaterThan(245);
    expect(data[i + 1]).toBeGreaterThan(245);
  });

  test('WebP tool explains when a JPG is added', async ({ page }) => {
    await gotoTool(page, '/tools/webp-to-jpg');
    await addFiles(page, 'photo.jpg');
    await expect(resultRows(page).first()).toContainText('already a JPG');
  });

  test('PNG → JPG with black background', async ({ page }) => {
    await gotoTool(page, '/tools/png-to-jpg');
    await page.getByRole('button', { name: 'Black' }).click();
    await addFiles(page, 'graphic.png');
    await waitForAllDone(page, 1);
    const { bytes } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    const { data, info } = await sharp(bytes).raw().toBuffer({ resolveWithObject: true });
    const i = (10 * info.width + info.width - 5) * 3;
    expect(data[i]).toBeLessThan(10);
  });

  test('JPG → PNG keeps dimensions and applies EXIF orientation', async ({ page }) => {
    await gotoTool(page, '/tools/jpg-to-png');
    await addFiles(page, 'rotated.jpg');
    await waitForAllDone(page, 1);
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('rotated.png');
    const m = await meta(bytes);
    expect(m.format).toBe('png');
    // 300×200 stored with orientation 6 → displayed 200×300.
    expect([m.width, m.height]).toEqual([200, 300]);
  });

  test('JPG/PNG → WebP (lossy and lossless) produces real WebP', async ({ page }) => {
    await gotoTool(page, '/tools/image-to-webp');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    let dl = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(dl.bytes.subarray(8, 12).toString()).toBe('WEBP');
    await page.getByLabel('Lossless WebP').check();
    await waitForAllDone(page, 1);
    await page.waitForTimeout(500);
    await waitForAllDone(page, 1);
    dl = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(dl.bytes.subarray(8, 16).toString()).toMatch(/WEBPVP8[LX]/);
  });

  test('Image Converter handles GIF, WebP and BMP-like mixes', async ({ page }) => {
    await gotoTool(page, '/tools/image-converter');
    await page.getByRole('radio', { name: 'PNG', exact: true }).check();
    await addFiles(page, 'image.gif', 'image.webp', 'photo.jpg');
    await waitForAllDone(page, 3);
    for (let i = 0; i < 3; i++) {
      const { bytes } = await download(page, resultRows(page).nth(i).getByRole('button', { name: 'Download' }));
      expect((await meta(bytes)).format).toBe('png');
    }
  });

  test('HEIC → JPG with the bundled decoder', async ({ page }) => {
    test.skip(!existsSync(fx('example.heic')), 'sample HEIC not available');
    test.setTimeout(120_000);
    await gotoTool(page, '/tools/heic-to-jpg');
    await addFiles(page, 'example.heic');
    await expect(page.locator('.results > li.result--done')).toHaveCount(1, { timeout: 90_000 });
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('example.jpg');
    const m = await meta(bytes);
    expect(m.format).toBe('jpeg');
    expect(m.width).toBeGreaterThan(100);
  });

  test('damaged HEIC fails with a message instead of hanging', async ({ page }) => {
    test.skip(!existsSync(fx('example.heic')), 'sample HEIC not available');
    const { readFileSync, writeFileSync } = await import('node:fs');
    writeFileSync(fx('broken.heic'), readFileSync(fx('example.heic')).subarray(0, 60_000));
    await gotoTool(page, '/tools/heic-to-jpg');
    await addFiles(page, 'broken.heic');
    await expect(resultRows(page).first()).toContainText(/could not be decoded|damaged/, { timeout: 60_000 });
    // A good file still converts afterwards.
    await addFiles(page, 'example.heic');
    await expect(page.locator('.results > li.result--done')).toHaveCount(1, { timeout: 60_000 });
  });

  test('HEIC tool rejects non-HEIC files helpfully', async ({ page }) => {
    await gotoTool(page, '/tools/heic-to-jpg');
    await addFiles(page, 'photo.jpg', 'small.png');
    await expect(resultRows(page).nth(0)).toContainText('already a JPG');
    await expect(resultRows(page).nth(1)).toContainText('not HEIC');
  });
});

test.describe('Image to PDF', () => {
  test('combines images in the chosen order', async ({ page }) => {
    await gotoTool(page, '/tools/image-to-pdf');
    await addFiles(page, 'photo.jpg', 'graphic.png', 'image.webp');
    await expect(page.locator('.pages > li')).toHaveCount(3);
    await page.getByRole('button', { name: 'Move image.webp up' }).click();
    await expect(page.locator('.pages > li').nth(1)).toContainText('image.webp');
    await page.getByRole('button', { name: /Create PDF \(3 pages\)/ }).click();
    const { bytes, name } = await download(page, page.getByRole('button', { name: 'Download PDF' }));
    expect(name).toBe('photo-and-2-more.pdf');
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(3);
    const [w, h] = [pdf.getPage(0).getWidth(), pdf.getPage(0).getHeight()];
    // Landscape photo on auto-rotated A4.
    expect(Math.round(w)).toBe(842);
    expect(Math.round(h)).toBe(595);
    // The original JPG is embedded byte-for-byte (no recompression).
    const original = (await import('node:fs')).readFileSync(fx('photo.jpg'));
    expect(bytes.includes(original.subarray(original.length - 4096))).toBe(true);
  });

  test('page size matching the image, HEIC included', async ({ page }) => {
    test.setTimeout(120_000);
    await gotoTool(page, '/tools/image-to-pdf');
    const files = ['small.png'];
    if (existsSync(fx('example.heic'))) files.push('example.heic');
    await addFiles(page, ...files);
    await page.getByLabel('Page size').selectOption('image');
    await page.getByRole('radio', { name: 'None', exact: true }).check();
    await page.getByRole('button', { name: /Create PDF/ }).click();
    const { bytes } = await download(page, page.getByRole('button', { name: 'Download PDF' }));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(files.length);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(48, 0);
  });

  test('bad files are listed but excluded', async ({ page }) => {
    await gotoTool(page, '/tools/image-to-pdf');
    await addFiles(page, 'fake.jpg', 'small.png');
    await expect(page.locator('.page-item--error')).toContainText('not a supported image');
    await expect(page.getByRole('button', { name: /Create PDF \(1 page\)/ })).toBeEnabled();
  });
});

test.describe('Crop, rotate, metadata', () => {
  test('crop to a 1:1 square', async ({ page }) => {
    await gotoTool(page, '/tools/image-cropper');
    await addFiles(page, 'photo.jpg');
    await expect(page.locator('.crop-box')).toBeVisible();
    await page.getByRole('radio', { name: '1:1' }).check();
    await expect(page.getByLabel('Width', { exact: true })).toHaveValue('1200');
    await page.getByLabel('Width', { exact: true }).fill('500');
    await expect(page.getByLabel('Height', { exact: true })).toHaveValue('500');
    await page.getByRole('button', { name: 'Crop image' }).click();
    const { bytes, name } = await download(page, page.locator('.crop-result').getByRole('button', { name: 'Download' }));
    expect(name).toBe('photo-cropped.jpg');
    const m = await meta(bytes);
    expect([m.width, m.height]).toEqual([500, 500]);
  });

  test('crop box moves with the keyboard', async ({ page }) => {
    await gotoTool(page, '/tools/image-cropper');
    await addFiles(page, 'photo.jpg');
    await page.getByRole('radio', { name: '1:1' }).check();
    const x = await page.getByLabel('X', { exact: true }).inputValue();
    await page.locator('.crop-box').focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(async () => Number(await page.getByLabel('X', { exact: true }).inputValue())).toBeLessThan(Number(x));
  });

  test('rotate right turns a portrait-oriented photo', async ({ page }) => {
    await gotoTool(page, '/tools/rotate-image');
    await addFiles(page, 'rotated.jpg');
    await page.getByRole('button', { name: /Right 90/ }).click();
    await page.getByRole('button', { name: 'Rotate image' }).click();
    await waitForAllDone(page, 1);
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('rotated-rotated.jpg');
    const m = await meta(bytes);
    expect([m.width, m.height]).toEqual([300, 200]);
  });

  test('EXIF viewer shows camera and warns about GPS', async ({ page }) => {
    await gotoTool(page, '/tools/exif-viewer');
    await addFiles(page, 'photo.jpg');
    await expect(page.locator('.notice--warn')).toContainText('GPS location');
    await expect(page.locator('.exif__summary')).toContainText('TestCam');
    await page.getByRole('button', { name: 'Start over' }).click();
    await addFiles(page, 'small.png');
    await expect(page.locator('.notice--good')).toContainText('No GPS');
  });

  test('Remove EXIF strips GPS losslessly', async ({ page }) => {
    await gotoTool(page, '/tools/remove-exif');
    await addFiles(page, 'photo.jpg');
    await waitForAllDone(page, 1);
    await expect(resultRows(page).first()).toContainText('Removed: EXIF');
    const { bytes, name } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
    expect(name).toBe('photo-clean.jpg');
    expect(await exifr.parse(bytes, { gps: true })).toBeUndefined();
    const original = (await import('node:fs')).readFileSync(fx('photo.jpg'));
    const [a, b] = await Promise.all([sharp(original).raw().toBuffer(), sharp(bytes).raw().toBuffer()]);
    expect(Buffer.compare(a, b)).toBe(0);
  });
});
