// Builds a copy of dist/ that works under any sub-path (e.g. a private claude.ai Artifact preview):
// root-absolute URLs ("/_astro/…", "/tools/x") become relative, pages get ".html", and "/" becomes
// "home.html". The production build in dist/ is not modified.
// Usage: node scripts/build-preview.mjs <outDir>
import { cp, readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, relative, dirname, posix } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const OUT = process.argv[2];
if (!OUT) throw new Error('Usage: node scripts/build-preview.mjs <outDir>');

await rm(OUT, { recursive: true, force: true });
await cp(DIST, OUT, { recursive: true });
await rename(join(OUT, 'index.html'), join(OUT, 'home.html'));
for (const f of ['_headers', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml']) await rm(join(OUT, f), { force: true });

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}
const files = await walk(OUT);
const pages = new Set(files.filter((f) => f.endsWith('.html')).map((f) => '/' + relative(OUT, f).replace(/\.html$/, '')));

function toRelative(fromFile, url) {
  let target = url;
  const [path, hash = ''] = target.split('#');
  if (path === '/' || path === '') target = '/home.html';
  else if (pages.has(path)) target = `${path}.html`;
  else target = path;
  const fromDir = posix.dirname('/' + relative(OUT, fromFile));
  let rel = posix.relative(fromDir, target);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel + (hash ? `#${hash}` : '');
}

for (const file of files) {
  if (file.endsWith('.html')) {
    let src = await readFile(file, 'utf8');
    // Only attribute values are rewritten, so inline-script CSP hashes stay valid.
    src = src.replace(/(\s(?:href|src|component-url|renderer-url|before-hydration-url)=")(\/(?!\/)[^"]*)"/g, (_, attr, url) => `${attr}${toRelative(file, url)}"`);
    await writeFile(file, src);
  } else if (file.endsWith('.js') && dirname(file).endsWith('_astro')) {
    let src = await readFile(file, 'utf8');
    src = src.replace(/new URL\(`\/_astro\//g, 'new URL(`./');
    src = src.replace('J=function(e){return`/`+e}', 'J=function(e){return new URL(`../`+e,import.meta.url).href}');
    // Some hosts reject a literal U+FFFD; inside JS string/template literals the escape is identical.
    src = src.replaceAll('\uFFFD', '\\uFFFD');
    await writeFile(file, src);
  }
}
const helper = files.find((f) => /preload-helper/.test(f));
if (helper && (await readFile(helper, 'utf8')).includes('return`/`+e')) throw new Error('Preload helper base was not rewritten (Vite output changed).');
console.log(`preview: ${files.length} files in ${OUT}`);
