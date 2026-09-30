import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { addFiles, download, expect, gotoTool, resultRows, test, waitForAllDone } from './helpers';

test('mobile: compress to KB end-to-end with touch-sized controls', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await gotoTool(page, '/tools/compress-image-to-kb');
  // Primary controls are at least 40px tall for touch.
  const box = await page.locator('.dropzone button').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: '50 KB' }).tap();
  await addFiles(page, 'photo.jpg');
  await waitForAllDone(page, 1);
  // On small screens results come before the settings.
  const resultsY = (await page.locator('.results').boundingBox())!.y;
  const optionsY = (await page.locator('.tool__options').boundingBox())!.y;
  expect(resultsY).toBeLessThan(optionsY);
  const { bytes } = await download(page, resultRows(page).first().getByRole('button', { name: 'Download' }));
  expect(bytes.length).toBeLessThanOrEqual(50_000);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('mobile: crop with touch drag on a handle', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await gotoTool(page, '/tools/image-cropper');
  await addFiles(page, 'photo.jpg');
  const handle = page.locator('.crop-handle--se');
  await expect(handle).toBeVisible();
  const hb = (await handle.boundingBox())!;
  const x = hb.x + hb.width / 2;
  const y = hb.y + hb.height / 2;
  // Simulate a pointer drag (touch devices emit pointer events).
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 80, y - 60, { steps: 5 });
  await page.mouse.up();
  const w = Number(await page.getByLabel('Width', { exact: true }).inputValue());
  expect(w).toBeLessThan(1600);
  await page.getByRole('button', { name: 'Crop image' }).tap();
  const { bytes } = await download(page, page.locator('.crop-result').getByRole('button', { name: 'Download' }));
  expect((await sharp(bytes).metadata()).width).toBe(w);
});

for (const path of ['/', '/tools', '/tools/image-compressor', '/tools/image-to-pdf', '/tools/image-cropper', '/tools/exif-viewer', '/privacy', '/methodology']) {
  test(`accessibility: ${path} has no serious axe violations`, async ({ page }) => {
    await page.goto(path);
    if (path.startsWith('/tools/')) await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
}

test('accessibility: tool with results and dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await gotoTool(page, '/tools/image-compressor');
  await addFiles(page, 'photo.jpg', 'fake.jpg');
  await waitForAllDone(page, 1);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
});
