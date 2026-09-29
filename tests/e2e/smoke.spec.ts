import { tools } from '../../src/data/tools';
import { expect, test } from './helpers';

const pages = ['/', '/tools', '/about', '/privacy', '/terms', '/contact', '/methodology', ...tools.map((t) => `/tools/${t.slug}`)];

for (const path of pages) {
  test(`page ${path} renders with SEO essentials and no errors`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\//);
    expect(new URL(canonical!).pathname).toBe(path);
    expect(await page.locator('meta[name=description]').getAttribute('content')).toBeTruthy();
    // No horizontal scrolling at any viewport.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if (path.startsWith('/tools/')) {
      // The tool island hydrates and shows its file picker.
      await expect(page.locator('.dropzone button').first()).toBeVisible();
    }
  });
}

test('unknown pages return 404 with a helpful page', async ({ page }) => {
  const res = await page.goto('/tools/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
  expect(await page.locator('meta[name=robots]').getAttribute('content')).toContain('noindex');
});

test('security headers are served', async ({ request }) => {
  const res = await request.get('/tools/image-compressor');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-content-type-options']).toBe('nosniff');
  const html = await res.text();
  expect(html).toMatch(/http-equiv="content-security-policy"[^>]*connect-src 'self'/);
  expect(html).toContain("form-action 'none'");
});

test('robots.txt and sitemap list every tool', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap:');
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  for (const t of tools) expect(sitemap).toContain(`/tools/${t.slug}</loc>`);
  expect(sitemap).not.toContain('404');
});

test('theme toggle switches and persists', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await page.click('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.click('#theme-toggle');
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('home search filters tools and recently used appears', async ({ page }) => {
  await page.goto('/tools/heic-to-jpg');
  await page.goto('/');
  await expect(page.locator('#recent-section')).toBeVisible();
  await expect(page.locator('#recent-list a')).toContainText(['HEIC to JPG']);
  await page.fill('#tool-search', 'heic');
  await expect(page.locator('[data-tool-grid] li:visible').first()).toContainText('HEIC');
  await page.fill('#tool-search', 'zzzzqqq');
  await expect(page.locator('#search-empty')).toBeVisible();
});
