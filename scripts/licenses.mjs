// Writes dist/third-party-licenses.txt with the licence texts of every package whose code is
// shipped to the browser. Required for the LGPL-3.0 HEIC decoder and good practice for the rest.
import { readdir, readFile, writeFile } from 'node:fs/promises';

const PACKAGES = [
  ['preact', 'https://github.com/preactjs/preact'],
  ['@preact/signals', 'https://github.com/preactjs/signals'],
  ['@preact/signals-core', 'https://github.com/preactjs/signals'],
  ['astro', 'https://github.com/withastro/astro'],
  ['pdf-lib', 'https://github.com/Hopding/pdf-lib'],
  ['@pdf-lib/standard-fonts', 'https://github.com/Hopding/standard-fonts'],
  ['@pdf-lib/upng', 'https://github.com/Hopding/upng'],
  ['pako', 'https://github.com/nodeca/pako'],
  ['tslib', 'https://github.com/microsoft/tslib'],
  ['exifr', 'https://github.com/MikeKovarik/exifr'],
  ['fflate', 'https://github.com/101arrowz/fflate'],
  ['upng-js', 'https://github.com/photopea/UPNG.js'],
  ['@jsquash/webp', 'https://github.com/jamsinclair/jSquash (libwebp: https://chromium.googlesource.com/webm/libwebp, BSD-3-Clause)'],
  ['wasm-feature-detect', 'https://github.com/GoogleChromeLabs/wasm-feature-detect'],
  [
    'heic-to',
    'https://github.com/hoppergee/heic-to — bundles libheif (https://github.com/strukturag/libheif, LGPL-3.0) and libde265 (https://github.com/strukturag/libde265, LGPL-3.0)',
  ],
];

const root = new URL('../node_modules/', import.meta.url);
const parts = [
  'Third-party software used in the browser by this website',
  '==========================================================',
  '',
  'The HEIC decoder (heic-to / libheif / libde265) is licensed under the GNU LGPL v3.0. It is loaded as a',
  'separate JavaScript file only when a HEIC image is opened in a browser without native HEIC support.',
  'Its complete corresponding source code is available at the project URLs below, for the exact version',
  'listed. You may replace that file with a modified build of the library.',
  '',
];

for (const [name, url] of PACKAGES) {
  const dir = new URL(`${name}/`, root);
  const pkg = JSON.parse(await readFile(new URL('package.json', dir), 'utf8'));
  const files = await readdir(dir);
  const licFile = files.find((f) => /^(licen[cs]e|copying)/i.test(f));
  const text = licFile ? await readFile(new URL(licFile, dir), 'utf8') : `License: ${pkg.license}`;
  parts.push('-'.repeat(78), `${name} ${pkg.version} — ${pkg.license}`, `Source: ${url}`, '', text.trim(), '');
}

await writeFile(new URL('../dist/third-party-licenses.txt', import.meta.url), parts.join('\n'));
console.log(`licenses: wrote notices for ${PACKAGES.length} packages`);
