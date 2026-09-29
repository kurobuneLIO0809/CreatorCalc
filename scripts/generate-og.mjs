// Generates Open Graph images (1200×630) for the home page and every tool, plus PNG icons,
// by screenshotting simple HTML templates with Playwright's Chromium. Run: npm run og
// Output is committed to public/ so builds do not need a browser.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const { tools } = await import('../src/data/tools.ts').catch(async () => {
  // Node cannot import .ts directly without a loader; parse the registry instead.
  const src = await (await import('node:fs/promises')).readFile(new URL('../src/data/tools.ts', import.meta.url), 'utf8');
  const entries = [...src.matchAll(/slug: '([^']+)',[\s\S]*?name: '([^']+)',[\s\S]*?tagline: '([^']+)'/g)].map((m) => ({ slug: m[1], name: m[2], tagline: m[3] }));
  return { tools: entries };
});

const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await mkdir(new URL('../public/og/', import.meta.url), { recursive: true });

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const logo = `<svg viewBox="0 0 32 32" width="72" height="72"><rect width="32" height="32" rx="8" fill="#0d7a6f"/><path d="M9 12h11l-3-3M23 20H12l3 3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const template = (title, subtitle) => `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;width:1200px;height:630px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans',sans-serif;
  background:linear-gradient(135deg,#f6f7f9 0%,#e2f4f1 100%);color:#16202a;display:flex;flex-direction:column;justify-content:space-between;padding:72px;box-sizing:border-box}
  .brand{display:flex;align-items:center;gap:20px;font-size:40px;font-weight:700}
  h1{font-size:${title.length > 28 ? 72 : 88}px;line-height:1.05;margin:0 0 20px;letter-spacing:-1.5px;max-width:1000px}
  p{font-size:34px;margin:0;color:#3a4652;max-width:1000px}
  .pill{display:inline-block;margin-top:28px;padding:10px 22px;border-radius:999px;background:#0d7a6f;color:#fff;font-size:26px;font-weight:600}
</style></head><body><div class="brand">${logo}QuickConvert</div><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p>
<span class="pill">Free · No sign-up · Files stay on your device</span></div></body></html>`;

const jobs = [{ file: 'default', title: 'Free image tools', subtitle: 'Compress, resize, convert HEIC & WebP, make PDFs — right in your browser.' }, ...tools.map((t) => ({ file: t.slug, title: t.name, subtitle: t.tagline }))];
for (const job of jobs) {
  await page.setContent(template(job.title, job.subtitle));
  await page.screenshot({ path: new URL(`../public/og/${job.file}.png`, import.meta.url).pathname });
}

for (const size of [32, 180, 192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${logo.replace('width="72" height="72"', `width="${size}" height="${size}"`)}</body></html>`);
  const name = size === 32 ? 'favicon-32.png' : size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname, omitBackground: true });
}
await browser.close();
console.log(`Generated ${jobs.length} OG images and 4 icons.`);
