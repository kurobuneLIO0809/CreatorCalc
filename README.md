# QuickConvert

**Free image tools. No account. Files stay on your device.**

QuickConvert (provisional name) is a static website of image tools that run entirely in the browser:
compress, compress to an exact KB size, resize, convert (HEIC, WebP, PNG, JPG, AVIF…), image → PDF, crop,
rotate, and view/remove EXIF metadata. There is no backend, no database, no upload endpoint and no paid API,
so it can be hosted for free on Cloudflare Pages.

- Why this product and these tools: [docs/strategy.md](docs/strategy.md)
- SEO design: [docs/seo.md](docs/seo.md)
- Tests and results: [docs/testing.md](docs/testing.md)
- Long-term plan and first-90-days measurement: [docs/roadmap.md](docs/roadmap.md)
- **Before launch:** [docs/launch-checklist.md](docs/launch-checklist.md)

## Purpose

Build a service that can grow to a very large number of monthly users through organic search, be monetized
later with non-intrusive ads, and cost ~$0 to run — by doing the work on the user's device instead of on
servers. Every claim the site makes about privacy ("files are not uploaded") is backed by the code and by a
Content-Security-Policy that blocks connections to other origins.

## Implemented tools (Phase 1)

| Tool | URL | Notes |
|---|---|---|
| Image Compressor | `/tools/image-compressor` | JPG/WebP quality, PNG palette quantization, optional max side, before/after compare, never returns a bigger file |
| Compress to exact KB | `/tools/compress-image-to-kb` | Binary search on quality + proportional downscale; 1 KB = 1,000 bytes (safe for both conventions) |
| Image Resizer | `/tools/image-resizer` | Pixels (fit/stretch), percentage, presets, no-upscale option, multi-step high-quality downscaling |
| Image Converter | `/tools/image-converter` | Any supported input → JPG/PNG/WebP |
| HEIC to JPG | `/tools/heic-to-jpg` | Native decode on Safari, lazy libheif (heic-to, LGPL) elsewhere |
| WebP to JPG | `/tools/webp-to-jpg` | Background colour for transparency, PNG option |
| PNG to JPG | `/tools/png-to-jpg` | Background colour choice |
| JPG to PNG | `/tools/jpg-to-png` | Honest explanation of what PNG does/doesn't do |
| JPG/PNG to WebP | `/tools/image-to-webp` | Lossy/lossless; WASM libwebp fallback so Safari/iOS produce real WebP |
| Image to PDF | `/tools/image-to-pdf` | Reorder, A4/Letter/fit, margins; JPGs embedded byte-for-byte |
| Image Cropper | `/tools/image-cropper` | Touch-friendly handles, aspect presets, exact pixel inputs, keyboard control |
| Rotate & Flip | `/tools/rotate-image` | Batch, live preview |
| EXIF Viewer | `/tools/exif-viewer` | Summary, GPS warning, all tags, copy/JSON export |
| Remove EXIF | `/tools/remove-exif` | **Lossless** removal for JPG/PNG/WebP (no re-encoding), optional keep orientation/ICC |

Common to all tools: drag & drop, file picker, paste from clipboard, batch (up to 50 files), progress, cancel,
reset, download, ZIP download, copy image to clipboard, clear error messages, dark mode, mobile layout.

Site pages: `/`, `/tools`, `/about`, `/privacy`, `/terms`, `/contact`, `/methodology`, custom 404,
`/robots.txt`, `/sitemap-index.xml`.

## Tech stack

- [Astro](https://astro.build/) 7 — static site generation, one HTML page per URL, CSP hashing
- [Preact](https://preactjs.com/) islands — interactive tools (hydrated only on tool pages)
- TypeScript, plain CSS (design tokens, light/dark themes), no web fonts
- Browser APIs: `createImageBitmap`, `OffscreenCanvas` in a Web Worker (cancellable), Clipboard API
- WebAssembly/JS codecs loaded on demand: `@jsquash/webp` (libwebp), `heic-to` (libheif), `upng-js`, `pdf-lib`, `exifr`, `fflate`
- Tests: Vitest (unit), Playwright + axe-core (E2E, mobile, accessibility)
- Hosting: Cloudflare Pages (static), `_headers` for security headers

## Getting started

Requirements: Node.js ≥ 22.12 (see `.node-version`).

```bash
npm install
npm run dev        # development server (CSP is not applied in dev mode)
npm run build      # production build to dist/ + post-build SEO/CSP checks
npm run preview    # serve dist/ like Cloudflare Pages (clean URLs, _headers, 404)
```

Tests:

```bash
npm test                     # unit tests (Vitest)
npm run check                # TypeScript / Astro type check
npm run test:e2e             # Playwright E2E (builds must exist: run `npm run build` first)
BASE_URL=https://<preview>.pages.dev npm run test:e2e   # run the E2E suite against a deployment
npm run verify               # all of the above
```

E2E tests need a Chromium. In Claude Code cloud sessions the pre-installed one is used automatically; elsewhere
run `npx playwright install chromium` once. `npm run og` regenerates Open Graph images and icons (committed in
`public/`).

## Deploying to Cloudflare Pages (free)

1. Push this repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick the repository.
3. Build settings: Framework preset **Astro** (or none) · Build command `npm run build` · Output directory `dist`.
4. **Environment variables** (Settings → Variables and Secrets, for *Production*):
   - `SITE_URL` = the production URL, e.g. `https://<project-name>.pages.dev` (**required** — the production
     build fails without it, to avoid wrong canonical URLs)
   - optional `CF_WEB_ANALYTICS=off` if you will not enable Cloudflare Web Analytics
   - optional `PRODUCTION_BRANCH` if your production branch is not `main`
5. Deploy. Preview deployments of other branches are automatically `noindex` (meta robots + `Disallow: /` in robots.txt).
6. Optional: enable **Web Analytics** for the project (cookieless). The CSP already allows its beacon.
7. Add the site to **Google Search Console** (URL-prefix property, HTML-tag or HTML-file verification) and
   submit `https://<your-site>/sitemap-index.xml`.

Alternative without Git: `npx wrangler pages deploy dist --project-name quickconvert` (requires a Cloudflare
login). A custom domain can be added later in the Pages project; update `SITE_URL` and redeploy.

## Project structure

```
src/
  config/site.ts            brand name, limits (file size, batch, canvas budgets)
  data/tools.ts             tool registry: slug, titles, descriptions, related tools, lastmod
  data/content.ts           hand-written per-tool content (intro, steps, use cases, specs, limits, FAQ)
  data/categories.ts        categories (image live; pdf/gif/video/audio/text planned)
  lib/                      pure, unit-tested logic
    format.ts               magic-byte format detection + header dimension parsing
    filename.ts             output-name sanitising, de-duplication
    target-size.ts          quality/dimension search for "compress to X KB"
    resize.ts               resize/crop/rotation geometry
    pdf-layout.ts           page placement for image → PDF
    metadata/{jpeg,png,webp}.ts   lossless metadata removal
    zip.ts, bytes.ts
  services/                 browser runtime
    engine.ts               input validation, HEIC decode, worker orchestration, cancellation
    pipeline.ts             decode → crop → rotate/flip → resize → encode (worker or main thread)
    encoders.ts, canvas.ts  JPG/PNG/WebP encoding, WASM WebP fallback, PNG quantization
    image.worker.ts         Web Worker entry
    download.ts             download / clipboard helpers
  components/               Astro components (header, footer, grids, search)
  components/tool-ui/       shared Preact UI: Dropzone, BatchTool, fields, CompareSlider, useBatch
  tools/                    one Preact app per tool (or tool family)
  layouts/, pages/, styles/
public/                     _headers, icons, OG images, tiny theme/recent-tools scripts
scripts/                    postbuild checks, Cloudflare-like preview server, OG image generator
tests/unit, tests/e2e       Vitest and Playwright suites
docs/                       strategy, SEO, testing, roadmap
```

### Adding a tool

1. Add an entry to `src/data/tools.ts` (slug, titles, description, related, updated).
2. Write genuinely specific content in `src/data/content.ts` (the type forces all sections).
3. Implement the app in `src/tools/` — usually a small options component on top of `BatchTool` and
   `ImageEngine`; reuse `lib/` helpers and add unit tests for new logic.
4. Register it in `src/components/ToolIsland.astro`, generate its OG image (`npm run og`), add E2E tests.
New categories (PDF, GIF, …) reuse the same registry/content/island pattern.

### Monetization hooks (not active)

The layout keeps the tool area free of third-party code. When ads are introduced, add fixed-height slots
between content sections on tool pages (never inside the tool or above it), extend the CSP for the ad network
only on those pages, and update the privacy policy and consent handling first. See docs/strategy.md §6.

## Configuration notes

- Brand name and limits: `src/config/site.ts`. "QuickConvert" is already used by ≥ 7 unrelated conversion
  products — rename before launch (shortlist in docs/strategy.md §9), then run `npm run og`.
- `features.heicDecoder` in `src/config/site.ts`: set to `false` to ship without the LGPL/HEVC decoder
  (removes the HEIC to JPG page and its links; see docs/strategy.md §11).
- Licence notices for all client-side code are generated into `dist/third-party-licenses.txt` at build time.
- Contact channel: `site.contactUrl` (currently the GitHub issue tracker; set a support email before applying
  for AdSense).

## What to add next

See the TOP-20 list in [docs/roadmap.md](docs/roadmap.md). Highest priority: search-data-driven improvements,
passport/ID photo maker, PDF merge/split, WebP/AVIF output improvements, GIF maker, and localization of the
best pages.

## Licence notes

Third-party components and their licences are listed on `/methodology#open-source`. The HEIC decoder
(`heic-to` / libheif) is LGPL-3.0 and is shipped as a separate, lazily loaded file built from the unmodified library (it can be replaced independently).
