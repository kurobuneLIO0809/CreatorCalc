// Post-build checks: fails the build if any indexable page is missing SEO essentials
// or violates our CSP assumptions (inline style attributes, missing CSP meta, etc.).
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const errors = [];
const warnings = [];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
const titles = new Map();
const descriptions = new Map();

for (const file of html) {
  const rel = relative(DIST, file);
  const src = await readFile(file, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(src);
  const title = src.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = src.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = (src.match(/<h1[\s>]/g) || []).length;

  if (!/http-equiv="content-security-policy"/i.test(src)) errors.push(`${rel}: missing CSP meta tag`);
  if (/\sstyle="/.test(src)) errors.push(`${rel}: inline style attribute (blocked by CSP)`);
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc) errors.push(`${rel}: missing meta description`);
  if (h1s !== 1) errors.push(`${rel}: expected exactly one <h1>, found ${h1s}`);
  if (noindex) continue;
  if (!canonical || !/^https:\/\//.test(canonical)) errors.push(`${rel}: canonical must be an absolute https URL`);
  if (canonical && canonical !== '/' && /\/$/.test(new URL(canonical).pathname) && new URL(canonical).pathname !== '/') errors.push(`${rel}: canonical has a trailing slash`);
  if (title && (title.length < 20 || title.length > 70)) warnings.push(`${rel}: title length ${title.length}`);
  if (desc && (desc.length < 70 || desc.length > 170)) warnings.push(`${rel}: description length ${desc.length}`);
  if (title) titles.set(title, [...(titles.get(title) ?? []), rel]);
  if (desc) descriptions.set(desc, [...(descriptions.get(desc) ?? []), rel]);
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
    if (!src.includes(`"${prop}"`)) errors.push(`${rel}: missing ${prop}`);
  }
  const og = src.match(/property="og:image" content="([^"]*)"/)?.[1];
  if (og) {
    const path = new URL(og).pathname;
    try {
      await stat(join(DIST, path));
    } catch {
      errors.push(`${rel}: og:image file ${path} does not exist`);
    }
  }
}

for (const [t, pages] of titles) if (pages.length > 1) errors.push(`duplicate title "${t}": ${pages.join(', ')}`);
for (const [d, pages] of descriptions) if (pages.length > 1) errors.push(`duplicate description: ${pages.join(', ')}`);

for (const required of ['robots.txt', 'sitemap-index.xml', '_headers', '404.html', 'favicon.svg']) {
  if (!files.some((f) => relative(DIST, f) === required)) errors.push(`missing ${required}`);
}

const sizes = files.filter((f) => /\.(js|wasm|css)$/.test(f));
let total = 0;
for (const f of sizes) {
  const s = (await stat(f)).size;
  total += s;
  if (s > 25 * 1024 * 1024) errors.push(`${relative(DIST, f)} exceeds Cloudflare Pages' 25 MiB file limit`);
}

console.log(`postbuild: ${html.length} HTML pages checked, ${sizes.length} JS/WASM/CSS assets (${(total / 1024 / 1024).toFixed(2)} MB total)`);
for (const w of warnings) console.warn(`  warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`  error: ${e}`);
  process.exit(1);
}
console.log('postbuild: OK');
