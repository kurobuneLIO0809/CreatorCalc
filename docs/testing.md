# Testing

_Last run: 2026-09-30 (Node 22.22, Chromium 140 headless, Playwright 1.55, Vitest 5). **Launch configuration: name Wrenfile, HEIC disabled.**_

## Summary

| Suite | Command | Result |
|---|---|---|
| Type check (Astro + TS) | `npm run check` | **0 errors, 0 warnings** |
| Unit tests | `npm test` | **73 / 73 passed** (incl. Search Console analyzer and i18n dictionaries) |
| Build + post-build checks | `npm run build` | **OK** — 96 HTML pages in 6 languages validated (title, description, canonical, OG, single H1, `<html lang>`, CSP meta, no inline styles, no duplicate titles/descriptions, **no broken internal links**, **reciprocal hreflang + x-default**, licence notice present, **HEIC decoder not shipped**) |
| E2E — local Cloudflare-like server | `npm run test:e2e` | **193 passed**, 5 skipped (2 mobile-only tests on the desktop project, 3 tests that only apply when HEIC is enabled) |
| E2E — `wrangler pages dev` (Cloudflare's own asset server & `_headers`) | `BASE_URL=http://127.0.0.1:8788 npx playwright test tests/e2e/i18n.spec.ts tests/e2e/smoke.spec.ts --project=desktop` | **104 passed** (full suite: 102 passed in the previous run) |
| Lighthouse 12 (mobile emulation) | /, compress-image-to-kb, image-converter; /ja, /ko/tools/image-compressor, /fr/tools/compress-image-to-kb | **99–100 / 100 / 100 / 100** (Perf / A11y / Best practices / SEO) |
| axe-core (WCAG 2.1 A/AA) | in E2E | **0 serious/critical violations** on 14 pages (incl. ja, zh, ko, fr, it) + a tool with results in dark mode, desktop and mobile |

## A global "no upload" guard

Every E2E test runs with an automatic fixture (`tests/e2e/helpers.ts`) that **fails the test** if the page:

- makes any request to another origin,
- makes any non-GET request, or any request with a body,
- throws an uncaught error or logs a console error (this includes CSP violations).

So every tool test is also a proof that the tool processed files without uploading them, under the
production Content-Security-Policy.

## Unit tests (`tests/unit`)

| File | Covers |
|---|---|
| `format.test.ts` | Magic-byte detection of JPG/PNG/WebP/GIF/TIFF/AVIF from real encoded files; HEIC vs AVIF `ftyp` brands; SVG (incl. BOM), PDF, EXE/HTML renamed to .jpg, empty/truncated input; header dimensions for JPG (incl. after a 20 KB EXIF block), PNG, GIF, WebP lossy/lossless/alpha; decompression-bomb PNG header |
| `filename-bytes-zip.test.ts` | Path traversal (`../../`), Windows paths, illegal characters, RTL-override spoofing (`invoice‮gpj.exe`), control chars, reserved names (`CON`), empty names, emoji truncation without broken surrogates, forced extensions, case-insensitive de-duplication; byte formatting; 1 KB = 1,000-byte budget; flat ZIP with unique names |
| `geometry.test.ts` | Resize by percent/box/fit/stretch/longest side, no-upscale, never 0 px; canvas pixel budget; rotation normalisation; crop clamping; centred aspect crops; crop-frame drag gestures (move, edges, corners, min size, aspect lock, bounds); PDF page placement (auto orientation, margins, image-sized pages, 200-inch cap) |
| `target-size.test.ts` | Stops at max quality when it fits; binary search finds optimum (±1 step) ; downscales when minimum quality is too big; reports impossible targets; honours AbortSignal |
| `metadata.test.ts` | JPEG: EXIF+GPS removed and **pixels bit-identical** (verified by decoding with sharp), orientation-only EXIF kept and readable by exifr/sharp, trailing data after EOI removed, COM removed, ICC kept/removed on request, progressive JPEG, truncated/invalid input rejected; PNG: tEXt/iTXt/eXIf removed, pixels identical, alpha kept, truncated input rejected; WebP: EXIF chunk removed, VP8X flags and RIFF size fixed, pixels identical |

## E2E tests (`tests/e2e`)

### Smoke (`smoke.spec.ts`) — desktop and mobile

- All 21 indexable pages: HTTP 200, exactly one H1, absolute canonical equal to the path, meta description,
  **no horizontal overflow**, tool island hydrates.
- Unknown URL → HTTP 404 + noindex page.
- Security headers (`frame-ancestors`, `nosniff`) and CSP meta (`connect-src 'self'`, `form-action 'none'`).
- robots.txt and sitemap list every tool, 404 excluded.
- Theme toggle cycles and persists; home search filters; "Recently used" appears after visiting a tool.

### Tools (`tools.spec.ts`) — desktop

| Area | Cases |
|---|---|
| Compressor | JPG compressed, output decodes, dimensions kept, **EXIF/GPS absent**; auto re-run on setting change → WebP output; PNG quantized keeps alpha; batch ZIP with 3 files; 1×1 JPG → original kept (never bigger); rejects **empty, HTML renamed .jpg, SVG with script, 3.6-gigapixel PNG bomb, .txt, corrupt JPEG, GIF** with specific messages; Japanese + `<x>&"` file name shown as text and sanitised on download; **cancel** mid-batch, **reset**, tool usable again after cancel; before/after compare |
| Compress to KB | 100 KB target → ≤ 100,000 bytes and > 50 KB (quality not wasted); 20 KB on a 20 MP image → fits via downscaling; custom 300 KB; invalid 2 KB → clear error, fixed by editing the value |
| Resizer | 800 px width → 800×600, name `photo-800x600.jpg`, PNG stays PNG; 200% with no-upscale keeps 64×48; missing dimensions → error |
| Converters | WebP→JPG fills transparency white; JPG in WebP tool → "already a JPG"; PNG→JPG with black background; JPG→PNG applies EXIF orientation (300×200 + orientation 6 → 200×300); JPG→WebP lossy and lossless both produce real WebP; converter hub GIF/WebP/JPG → PNG; HEIC→JPG with the bundled libheif decoder and HEIC-tool messages (run only when HEIC is enabled; all passed in the enabled configuration) |
| HEIC disabled | `/tools/heic-to-jpg` is 404; HEIC files dropped into the converter, compress-to-KB, remove-EXIF and image-to-PDF show "HEIC (iPhone) photos are not supported yet"; **no request for the decoder** is made; the EXIF viewer still reads HEIC metadata |
| Robustness | truncated HEIC → clear error (no hang) and the next HEIC still converts; **main-thread fallback with `OffscreenCanvas` removed** (simulates Safari < 16.4) produces real WebP files |
| Image to PDF | 3 images reordered → 3-page PDF, landscape A4 page, **original JPG bytes embedded unchanged**; image-sized pages incl. HEIC; bad files listed but excluded |
| Crop / rotate / EXIF | 1:1 crop with numeric width → 500×500; keyboard moves crop frame; rotate right on an orientation-6 photo; EXIF viewer shows camera + GPS warning, "No GPS" for clean PNG; Remove EXIF → GPS gone and **pixels bit-identical** |

### Languages (`i18n.spec.ts`) — desktop

- Every translated page (5 languages × home, tools index, 13 tool pages = 75 pages): HTTP 200, correct
  `<html lang>`, self-referencing canonical and hreflang, `x-default` → English, no horizontal overflow, the
  island hydrates with that language's strings, and tool links stay inside the language.
- The language menu on an English tool page leads to the same tool in Japanese; English-only pages have no
  hreflang and send each language to its home page.
- Japanese compressor end to end: result text, a fake file error and a worker decode error are all
  Japanese (worker errors travel as message keys); download name unchanged.
- French "compress to KB" run reports byte counts in French.
- `tests/unit/i18n.test.ts`: every dictionary has exactly the English keys and the same `{placeholders}`;
  every published tool is fully translated with the same number of steps/use cases/specs/FAQ as English;
  related links stay within translated pages; no HEIC support claims while the decoder is off.

### Mobile & accessibility (`mobile.spec.ts`)

- Pixel 7 emulation (touch, 412 px): compress-to-50 KB flow with taps, controls ≥ 44 px, results shown before
  settings, no horizontal overflow.
- Crop by dragging a corner handle with pointer events; output width equals the chosen width.
- axe-core WCAG 2.1 A/AA scan on 8 pages (both viewports) and on a tool with results in dark mode.

## Bugs found and fixed during development

| # | Problem | Fix |
|---|---|---|
| 1 | JPEG stripper would have mis-parsed scans whose entropy data starts with `FF 00` | Treat `FF 00` after SOS as data; unit-tested with progressive JPEGs |
| 2 | Orientation-only EXIF block could be written after other APP segments | Always inserted directly after SOI/APP0 |
| 3 | On phones, results appeared below a long settings panel | Results-first layout on small screens; sticky side panel on desktop |
| 4 | "KB" unit label wrapped onto two lines on mobile | `nowrap` suffix, flexible input |
| 5 | Sticky header could cover focused controls | `scroll-padding-top` |
| 6 | Clicks before the tool island hydrated were silently lost | Tool UI is visibly inactive until hydrated; E2E waits for hydration |
| 7 | SVG logo colours via `fill="var(--…)"` attributes are unreliable | Colours moved to CSS classes |
| 8 | Web Workers do not inherit the page's `<meta>` CSP | Separate CSP header for `/_astro/*` in `_headers` |
| 9 | Very large PDF/ZIP jobs could exhaust memory | 400 MB combined-size guard with a clear message |
| 10 | Two meta descriptions outside the recommended length | Rewritten |
| 11 | Safari 16.0–16.3 expose `OffscreenCanvas` without 2D support → main-thread fallback would fail | Capability check (`getContext('2d')`), not constructor check; E2E test for the fallback |
| 12 | HEIC/AVIF files had no dimension check before decoding (bomb risk, huge 48 MP decodes) | `ispe` box parser; unit-tested incl. forged header |
| 13 | 100 MP desktop canvas budget too high for low-RAM laptops/Android | 50 MP desktop, 24 MP when `deviceMemory` ≤ 4 GB, 16.7 MP iOS; decode limit lowered on low-RAM devices |
| 14 | PNG colour quantization could use several hundred MB on very large images | Skipped above 20 MP with a visible note |
| 15 | LGPL decoder shipped without licence text | Generated `/third-party-licenses.txt`, linked in footer and methodology |
| 16 | Brand name hard-coded in 10 places (manifest, OG images, pages) | All derive from `site.name`; manifest generated at build |

Environment notes (not product bugs): Playwright's path-based upload fails for file names containing `"`;
Chromium without a UTF-8 locale renames non-ASCII downloads to "download" — tests set `LANG=C.UTF-8` and use
in-memory uploads for exotic names.

## Initial load weight (gzip, measured in the browser)

| Page | HTML | JS | CSS | Fonts / images |
|---|---|---|---|---|
| `/` | 5.5 KB | 1.2 KB | 5.2 KB | none |
| `/tools/image-compressor` | 8.0 KB | 27.7 KB | 5.2 KB | none |
| `/tools/image-to-pdf` | 6.7 KB | 22.3 KB | 5.2 KB | none |

Loaded only on demand: pdf-lib 158 KB, exifr 25 KB, UPNG+pako 35 KB, libwebp WASM 110–125 KB,
HEIC decoder 712 KB (gzip). No web fonts; OG images are never loaded by pages.

## iPhone Safari — static audit (no real device available)

**Real iOS/Safari behaviour has NOT been verified.** WebKit is not installable in this environment, so the
following is a code review against known WebKit behaviour, not a test result.

| Area | Code path | Risk | Mitigation in code |
|---|---|---|---|
| WebP encoding | `encoders.ts` | Safari returns PNG from `convertToBlob({type:'image/webp'})` | Result MIME is checked; WASM libwebp fallback (exercised in Chromium via lossless mode and the no-OffscreenCanvas test) |
| OffscreenCanvas | `canvas.ts`, `engine.ts` | 16.0–16.3: no 2D context; < 16.4: no worker pipeline | Capability detection; main-thread fallback (tested) |
| Canvas memory | `engine.ts canvasBudget` | iOS rejects canvases > ~16.7 MP and has a global canvas memory budget | Outputs capped at 16.7 MP with a note; canvases released (`width = 0`) after use |
| Full-size decode | `createImageBitmap` | A 48 MP photo still decodes to ~190 MB before scaling | Header size checks; **could crash old iPhones** — confirm on device |
| EXIF orientation | `imageOrientation: 'from-image'` | Older WebKit may ignore the option | Modern Safari applies orientation by default; verify with a rotated photo |
| HEIC | `decodeHeic` | Assumes Safari's `createImageBitmap` decodes HEIC; if not, the slow JS decoder is used | Works either way, only speed differs |
| Downloads | `download.ts` | iOS shows a download sheet per file; object URL revoked after 60 s | ZIP for batches |
| Clipboard | `ClipboardItem` with a Promise | Supported by Safari; permission prompts differ | Errors show "use Download instead" |
| Touch | pointer events, `setPointerCapture`, `touch-action: none` | Supported since iOS 13 | 40 px handles on coarse pointers |
| File picker | `accept="image/*,.heic,…"` | iOS may hand over JPEG instead of HEIC depending on settings | Both formats are accepted |

## Not yet covered (manual QA before/after launch)

- **Real Safari / iOS** (WebKit is not available in this environment): native HEIC decode path, the WASM WebP
  fallback triggered by Safari's missing encoder (the same WASM encoder *is* exercised in Chromium via lossless
  mode), 16.7 MP canvas limit handling with 48 MP photos, file picker from Photos, download UX.
- **Firefox** (desktop/Android).
- Low-memory Android devices with 50-file batches.
- Screen reader walkthrough (VoiceOver, TalkBack) beyond automated axe checks.
- Production deployment smoke test: `BASE_URL=https://<project>.pages.dev npm run test:e2e`.
