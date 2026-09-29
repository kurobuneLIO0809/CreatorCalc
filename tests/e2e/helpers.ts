import { expect, test as base, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';

export const FIX = 'tests/e2e/.cache';
export const fx = (name: string) => `${FIX}/${name}`;

/**
 * Extends the base test so every test automatically fails on:
 * - uncaught page errors and console errors (incl. CSP violations),
 * - any request that is not a same-origin GET — i.e. proof that no file is uploaded.
 */
export const test = base.extend<{ guard: void }>({
  guard: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL!).origin;
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(m.text())) problems.push(`console: ${m.text()}`);
      });
      page.on('request', (r) => {
        const u = new URL(r.url());
        if (u.protocol === 'blob:' || u.protocol === 'data:') return;
        if (u.origin !== origin) problems.push(`cross-origin request: ${r.method()} ${r.url()}`);
        if (r.method() !== 'GET' && r.method() !== 'HEAD') problems.push(`non-GET request: ${r.method()} ${r.url()}`);
        const body = r.postData();
        if (body) problems.push(`request with body: ${r.url()}`);
      });
      await use();
      expect(problems, problems.join('\n')).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Opens a tool page and waits until its interactive island has hydrated. */
export async function gotoTool(page: Page, path: string) {
  await page.goto(path);
  await page.locator('astro-island').first().waitFor({ state: 'attached' });
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/** Uploads fixtures as in-memory payloads (path-based upload breaks on exotic file names). */
export async function addFiles(page: Page, ...names: string[]) {
  const input = page.locator('input[type=file]').first();
  // Path uploads for plain names (no 50 MB buffer limit); in-memory payloads for exotic names.
  if (names.every((n) => /^[\w.-]+$/.test(n))) return input.setInputFiles(names.map(fx));
  const payloads = await Promise.all(names.map(async (name) => ({ name, mimeType: 'application/octet-stream', buffer: await readFile(fx(name)) })));
  await input.setInputFiles(payloads);
}

export async function download(page: Page, trigger: Locator): Promise<{ name: string; bytes: Buffer }> {
  const [dl] = await Promise.all([page.waitForEvent('download'), trigger.click()]);
  const path = await dl.path();
  return { name: dl.suggestedFilename(), bytes: await readFile(path!) };
}

export function resultRows(page: Page) {
  return page.locator('.results > li');
}

export async function waitForAllDone(page: Page, count: number) {
  await expect(page.locator('.results > li.result--done')).toHaveCount(count, { timeout: 60_000 });
}
