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

// On Cloudflare Pages production builds the canonical origin must be configured explicitly.
const branch = process.env.CF_PAGES_BRANCH;
const isProduction = !!branch && branch === (process.env.PRODUCTION_BRANCH || 'main');
if (isProduction && !process.env.SITE_URL) {
  errors.push('SITE_URL is not set. Add it in Cloudflare Pages → Settings → Environment variables (e.g. https://<project>.pages.dev).');
}
if (!process.env.SITE_URL) warnings.push('SITE_URL not set — canonical URLs use the default https://wrenfile.pages.dev');

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

// Internal links must resolve to a built page or file (no broken links, no links to .html URLs).
const known = new Set(files.map((f) => '/' + relative(DIST, f)));
for (const file of html) {
  const src = await readFile(file, 'utf8');
  for (const [, href] of src.matchAll(/href="(\/[^"#?]*)/g)) {
    if (href.endsWith('.html')) errors.push(`${relative(DIST, file)}: link to .html URL ${href}`);
    const ok = href === '/' || known.has(href) || known.has(`${href}.html`);
    if (!ok) errors.push(`${relative(DIST, file)}: broken internal link ${href}`);
  }
}

for (const [t, pages] of titles) if (pages.length > 1) errors.push(`duplicate title "${t}": ${pages.join(', ')}`);
for (const [d, pages] of descriptions) if (pages.length > 1) errors.push(`duplicate description: ${pages.join(', ')}`);

for (const required of ['robots.txt', 'sitemap-index.xml', '_headers', '404.html', 'favicon.svg', 'site.webmanifest', 'third-party-licenses.txt']) {
  if (!files.some((f) => relative(DIST, f) === required)) errors.push(`missing ${required}`);
}

// With the HEIC decoder disabled, the LGPL decoder must not be shipped at all.
const siteSrc = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
if (/heicDecoder:\s*false/.test(siteSrc)) {
  const leaked = files.filter((f) => /heic-to/i.test(f));
  if (leaked.length) errors.push(`HEIC decoder disabled but shipped: ${leaked.map((f) => relative(DIST, f)).join(', ')}`);
  for (const f of html) if (/heic-to-jpg/.test(await readFile(f, 'utf8'))) errors.push(`${relative(DIST, f)}: links to disabled HEIC page`);
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
