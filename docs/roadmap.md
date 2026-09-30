# Roadmap

Strategy: **only expand where demand is proven.** Each phase has an entry condition based on data, not dates.
Revenue figures are targets, not forecasts.

## Phase 1 — Initial tools (done)

14 browser-only image tools, trust pages, SEO foundation, tests, Cloudflare Pages setup (see README).

Launch tasks (owner: you, needs your accounts):
- [ ] Choose a distinctive brand name (QuickConvert collides with existing products) — ideally before buying a domain.
- [ ] Create the Cloudflare Pages project, set `SITE_URL`, deploy, enable Web Analytics.
- [ ] Search Console: verify, submit sitemap, request indexing of the top 5 tools.
- [ ] Manual QA on a real iPhone (Safari) and Android (Chrome/Firefox) — see docs/testing.md "Not yet covered".
- [ ] Run `BASE_URL=https://<site> npm run test:e2e` against production.

## Phase 2 — Search data analysis (weeks 2–12 after launch)

Look at, in this order:
1. **Indexing** (Search Console → Pages): all 21 URLs indexed? If "Crawled – currently not indexed", improve
   uniqueness/depth of that page and internal links to it.
2. **Impressions per page & query**: which intents Google associates with us.
3. **CTR**: pages with impressions and CTR < 2% → rewrite title/description (A/B via date-separated changes).
4. **Position 8–30 queries**: add the missing feature or section that the query implies
   (e.g. "compress image to 50kb for passport" → passport presets & pixel requirements).
5. **Analytics**: visits → tool completion is not tracked (no event tracking by design); use page views,
   bounce and return visits, and user reports. Optional later: a privacy-preserving, file-free "tool used"
   counter via Cloudflare Web Analytics custom events, disclosed in the privacy policy.

If traffic is low after ~3 months: check indexing first, then content depth vs. top-ranking pages, then
backlinks (write 2–3 genuinely useful technical posts, submit to privacy/dev tool directories), then
consider a custom domain.

## Phase 3 — Expand proven categories (after ~5k monthly organic visits)

- Image tools suggested by queries: WebP→PNG, AVIF converter, passport/ID photo maker (crop to official
  sizes + target KB), image to base64, add text/watermark, blur/pixelate faces (manual regions), collage.
- Background removal only if an in-browser model with a compatible licence and acceptable size exists.
- Localization of the top 5 pages (Japanese, Spanish, Portuguese, Hindi, Indonesian) with `hreflang`,
  real translations and local examples (e.g. Japanese form size limits).
- PWA/offline mode (service worker) once the asset set is stable.

## Phase 4 — PDF (entry: image-to-pdf is a top page)

pdf-lib / pdf.js in the browser: merge, split, reorder/rotate pages, PDF → JPG, remove pages, add page numbers,
basic compression (image downsampling). Server-side OCR or Office conversion is out of scope for $0 hosting.

## Phase 5 — GIF

GIF maker from images, video → GIF (short clips, ffmpeg.wasm lazily loaded), resize/crop/optimize GIF,
GIF → MP4. Watch memory limits on phones.

## Phase 6 — Video

ffmpeg.wasm (single-threaded build unless cross-origin isolation is added): trim, compress, convert to MP4,
extract audio, mute. Clear size limits (e.g. ≤ 500 MB) and honest speed expectations.

## Phase 7 — Audio

Convert (MP3/WAV/OGG/M4A via ffmpeg.wasm or WebCodecs), trim, change volume/speed, extract audio from video.

## Phase 8 — Monetization (entry: ≥ 30k monthly sessions, stable Core Web Vitals)

1. Update privacy policy, add a consent management platform where required (EEA/UK), then apply for AdSense.
2. Fixed-height ad slots below the tool and between content sections only; none on legal pages; never inside
   the tool; measure CWV before/after.
3. Watch RPM by country and page; remove slots that hurt completion.
4. Later: ad-free supporter option, higher batch limits for power users, embeddable widget / B2B licence.

## Phase 9 — Reinvestment after ¥500k/month (~$3.3k)

- Custom domain + brand protection, professional translation for top languages.
- Paid device testing (BrowserStack) and accessibility audit.
- Contract a designer for illustrations and a writer for technical guides.
- Build the next category with the best measured demand; consider a desktop/offline app for power users.

## TOP 20 features to add next (priority order)

1. Passport / ID photo maker (official sizes + target KB)
2. WebP → PNG and AVIF converter pages (if queries show demand)
3. PDF merge
4. PDF → JPG
5. PDF split / extract pages
6. Batch rename in ZIP (custom naming pattern)
7. Add text / watermark to images
8. Blur / pixelate regions (privacy)
9. Image to Base64 / data URI
10. GIF maker from images
11. Video → GIF
12. Compress GIF
13. Collage / combine images side-by-side
14. Signature image cleaner (white background, crop, target KB for forms)
15. Favicon generator (ICO + PNG sizes)
16. Social media size presets with smart crop
17. Colour picker / palette from image
18. Offline PWA mode
19. Japanese localization of top pages
20. Upscale 2× (only if a small, licence-compatible in-browser model is available)
