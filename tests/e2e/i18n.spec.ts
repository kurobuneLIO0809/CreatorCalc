import { tools } from '../../src/data/tools';
import { LOCALE_INFO, TRANSLATED_LOCALES, uiMessages } from '../../src/i18n';
import { addFiles, download, expect, gotoTool, resultRows, test, waitForAllDone } from './helpers';

const localizedPages = TRANSLATED_LOCALES.flatMap((l) => [`/${l}`, `/${l}/tools`, ...tools.map((t) => `/${l}/tools/${t.slug}`)]);

test.describe('localized pages', () => {
  for (const path of localizedPages) {
    test(`${path} renders in its language with hreflang and no errors`, async ({ page }) => {
      const locale = path.split('/')[1] as (typeof TRANSLATED_LOCALES)[number];
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', LOCALE_INFO[locale].htmlLang);
      await expect(page.locator('h1')).toHaveCount(1);
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      expect(new URL(canonical!).pathname).toBe(path);
      expect(await page.locator(`link[rel=alternate][hreflang="${LOCALE_INFO[locale].htmlLang}"]`).getAttribute('href')).toBe(canonical);
      expect(new URL((await page.locator('link[rel=alternate][hreflang=x-default]').getAttribute('href'))!).pathname).toBe(path.replace(`/${locale}`, '') || '/');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      if (path.includes('/tools/')) {
        // The island hydrates with this language's strings.
        await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
        const choose = uiMessages(locale);
        await expect(page.locator('.dropzone button').first()).toHaveText(new RegExp(`${choose['dz.chooseMulti']}|${choose['dz.chooseSingle']}`));
        // Internal tool links stay inside the language.
        for (const href of await page.locator('.tool-grid a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) expect(href).toMatch(new RegExp(`^/${locale}/tools/`));
      }
    });
  }
});

test('English pages list every translation and the language menu switches to the same page', async ({ page }) => {
  await page.goto('/tools/image-resizer');
  for (const l of TRANSLATED_LOCALES) {
    expect(await page.locator(`link[rel=alternate][hreflang="${LOCALE_INFO[l].htmlLang}"]`).getAttribute('href')).toMatch(new RegExp(`/${l}/tools/image-resizer$`));
  }
  await page.locator('.lang-menu summary').click();
  await page.locator('.lang-menu a[hreflang=ja]').click();
  await expect(page).toHaveURL(/\/ja\/tools\/image-resizer$/);
  await expect(page.locator('h1')).toHaveText('画像リサイズ');
});

test('English-only pages send each language to its home page and carry no hreflang', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(0);
  expect(await page.locator('.lang-menu a[hreflang=fr]').getAttribute('href')).toBe('/fr');
});

test('Japanese compressor works end to end with localized results and errors', async ({ page }) => {
  await gotoTool(page, '/ja/tools/image-compressor');
  await addFiles(page, 'photo.jpg', 'fake.jpg', 'corrupt.jpg');
  const rows = resultRows(page);
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText('小さく', { timeout: 60_000 });
  await expect(rows.nth(1)).toContainText('対応している画像ではありません');
  // Decode failures come from the worker as message keys and are translated on the page.
  await expect(rows.nth(2)).not.toContainText('err.');
  await expect(rows.nth(2)).toContainText(/[ぁ-んァ-ン一-龯]/, { timeout: 30_000 });
  const { name } = await download(page, rows.nth(0).getByRole('button', { name: 'ダウンロード' }));
  expect(name).toBe('photo-compressed.jpg');
});

test('French target-size tool reports in French', async ({ page }) => {
  await gotoTool(page, '/fr/tools/compress-image-to-kb');
  await addFiles(page, 'photo.jpg');
  await waitForAllDone(page, 1);
  await expect(resultRows(page).first()).toContainText('octets');
});
