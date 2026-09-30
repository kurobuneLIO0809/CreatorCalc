# Testing

_Last run: 2026-09-29 (Node 22.22, Chromium 140 headless, Playwright 1.55, Vitest 5)._

## Summary

| Suite | Command | Result |
|---|---|---|
| Type check (Astro + TS) | `npm run check` | **0 errors, 0 warnings** (66 files) |
| Unit tests | `npm test` | **47 / 47 passed** |
| Build + post-build checks | `npm run build` | **OK** — 22 HTML pages validated (title, description, canonical, OG, single H1, CSP meta, no inline styles, no duplicate titles/descriptions) |
| E2E — local Cloudflare-like server | `npm run test:e2e` | **102 passed**, 2 skipped (mobile-only tests on the desktop project) |
| E2E — `wrangler pages dev` (Cloudflare's own asset server & `_headers`) | `BASE_URL=http://127.0.0.1:8788 npx playwright test` | **102 passed**, 2 skipped |
| Lighthouse 12 (mobile emulation) | home, image-compressor | **100 / 100 / 100 / 100** (Perf / A11y / Best practices / SEO); LCP 1.1–1.5 s, CLS 0, TBT 0 ms |
| axe-core (WCAG 2.1 A/AA) | in E2E | **0 serious/critical violations** on 8 pages + a tool with results in dark mode, desktop and mobile |

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
| Converters | WebP→JPG fills transparency white; JPG in WebP tool → "already a JPG"; PNG→JPG with black background; JPG→PNG applies EXIF orientation (300×200 + orientation 6 → 200×300); JPG→WebP lossy and lossless both produce real WebP; converter hub GIF/WebP/JPG → PNG; **HEIC→JPG with the bundled libheif decoder** (real HEIC sample); HEIC tool rejects JPG/PNG helpfully |
| Image to PDF | 3 images reordered → 3-page PDF, landscape A4 page, **original JPG bytes embedded unchanged**; image-sized pages incl. HEIC; bad files listed but excluded |
| Crop / rotate / EXIF | 1:1 crop with numeric width → 500×500; keyboard moves crop frame; rotate right on an orientation-6 photo; EXIF viewer shows camera + GPS warning, "No GPS" for clean PNG; Remove EXIF → GPS gone and **pixels bit-identical** |

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

Environment notes (not product bugs): Playwright's path-based upload fails for file names containing `"`;
Chromium without a UTF-8 locale renames non-ASCII downloads to "download" — tests set `LANG=C.UTF-8` and use
in-memory uploads for exotic names.

## Not yet covered (manual QA before/after launch)

- **Real Safari / iOS** (WebKit is not available in this environment): native HEIC decode path, the WASM WebP
  fallback triggered by Safari's missing encoder (the same WASM encoder *is* exercised in Chromium via lossless
  mode), 16.7 MP canvas limit handling with 48 MP photos, file picker from Photos, download UX.
- **Firefox** (desktop/Android).
- Low-memory Android devices with 50-file batches.
- Screen reader walkthrough (VoiceOver, TalkBack) beyond automated axe checks.
- Production deployment smoke test: `BASE_URL=https://<project>.pages.dev npm run test:e2e`.
