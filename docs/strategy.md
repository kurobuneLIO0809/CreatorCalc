# QuickConvert — Strategy

_Last updated: 2026-09-29. Research was done with web search on that date. Search-volume figures below are
directional (third-party estimates quoted in public articles), not measured data. Replace them with Google
Search Console + Keyword Planner data after launch._

## 1. Goal

Build a free, account-free, browser-first file tool site that can grow unique users through organic search
over the long term and later be monetized with ads (AdSense or similar), without paying for servers, APIs or
storage up front.

Principle: **ship a small number of genuinely good tools, measure, then expand where demand is proven.**

## 2. Competitor research

| Service | Model | Processing | Free limits (public info, 2026) | Strengths | Weaknesses we can exploit |
|---|---|---|---|---|---|
| iLoveIMG | Freemium + ads | Server upload | ~25 MB/file, ~15 files/batch on free tier | Huge brand, broad toolset, strong domain authority | Uploads every file; premium upsells; generic content |
| iLovePDF | Freemium | Server upload | Task/size limits | Brand, PDF breadth | Same as above; PDF is not our phase-1 focus |
| Smallpdf | Freemium | Server upload | **2 tasks per day** on free tier | Polished UX, trust | Very tight free limit → frustrated free users searching for alternatives |
| Convertio | Freemium | Server upload | 100 MB/file, 10 conversion-minutes per 24 h | 300+ formats | Daily caps, upload wait, privacy concerns |
| CloudConvert | Credits | Server upload | ~10 free conversions/day (reported, reduced from 25) | Quality, API | Credits, upload |
| EZGIF | Ads | Server upload | ~100 MB max | Deep GIF/video feature set, loyal users | Dated UI, heavy ads, uploads |
| Photopea | Ads (~90% of revenue) | **In browser** | none | Proof that a browser-only, ad-funded tool can reach ~12M monthly visitors and ~$3M/yr with ~$600/yr hosting | Full editor = overkill for "just convert this file" |
| remove.bg | Credits | Server AI | Low-res free preview | Best-in-class AI | Paid for full-res; needs server GPUs — not viable for us at $0 |
| TinyPNG | Freemium | Server upload | 20 images/session, 5 MB each | Brand, excellent PNG quantization | Upload, limits |
| Squoosh (Google) | Free | **In browser (WASM)** | none | Best codec quality, privacy | One image at a time, no batch, no target-size, no PDF |
| Many small "no-upload" sites (compressimage.io, heicsave, imresizer, kbcompressor …) | Ads | In browser | none | Same privacy pitch as ours | Usually one-trick, thin content, many make claims they don't prove |

Sources consulted: SitePoint "7 Best Free Online Image Compression Tools in 2026", BulkPicTools "Best Free
Image Compressors That Never Upload (2026)", Convertio help center (free tier limits), PDF Techno / PixelTools
comparisons of iLovePDF vs Smallpdf free limits, theimgapp "Best TinyPNG alternatives", Medium / Indie Hackers
/ builtplain articles on Photopea's revenue and traffic, heicify.com HEIC browser support guide, DEV Community
articles on Safari's `canvas.toBlob('image/webp')` silently returning PNG.

### Key observations

1. **The market leaders all upload files.** Privacy-conscious users (ID photos, passport scans, family photos)
   are a real segment; Reddit-style threads repeatedly complain about uploads, daily caps, watermarks and ads.
2. **"No upload" is no longer unique by itself.** Dozens of small sites say it. We need *proof* (a strict
   Content-Security-Policy that technically blocks cross-origin uploads, a methodology page, "verify it
   yourself" instructions) and *better tools* (batch, target size, honest results).
3. **Browser capability gaps are where small sites win:**
   - Safari (all iOS browsers) cannot encode WebP from `<canvas>` and silently returns PNG. Most
     "to WebP" sites therefore produce a mislabeled PNG on iPhone. We detect this and fall back to a
     WebAssembly WebP encoder.
   - Chrome/Edge/Firefox cannot decode HEIC natively (HEVC licensing). We try native decoding first (works
     in Safari) and lazy-load a decoder only when needed.
   - The Squoosh team proved WASM codecs work; nobody packages them into a batch-friendly, mobile-first,
     honest UX with target-size compression.
4. **Honest content is a differentiator.** e.g. "JPG to PNG does not improve quality and does not make the
   background transparent" — competitors rarely say this, but it is what users need to know.

## 3. Search demand & intent

Directional numbers (public third-party estimates): `jpg to pdf` ≈ 4.8M global monthly searches, `pdf to jpg`
≈ 3.4M, `compress pdf` ≈ 1.6M. Image conversions (`heic to jpg`, `webp to jpg`, `png to jpg`, `compress image`,
`resize image`) are each very large, head terms dominated by high-authority domains.

| Cluster | Intent | Competition | Browser-only? | Our angle | Priority |
|---|---|---|---|---|---|
| compress image / reduce image size | Make a file smaller for upload/email/web | Very high | Yes | Batch, before/after compare, never returns a bigger file | **P1** |
| compress image to 100KB / 50KB / 20KB | Hit a hard size limit on a form (passport, visa, exam, job portal) | Medium, many weak sites | Yes | Exact target-size search, shows the achieved size, sensitive docs never leave device | **P1 (best long-tail bet)** |
| resize image (pixels / percent) | Fit dimensions for a site/social/form | High | Yes | Batch, keeps aspect, no upscaling surprises | **P1** |
| heic to jpg | iPhone photo won't open on Windows/web forms | High, many clones | Yes (WASM) | Native decode on Safari, lazy decoder elsewhere, batch + ZIP | **P1** |
| webp to jpg / webp to png | Saved image from a website won't open or upload | High | Yes | Instant, batch | **P1** |
| png to jpg | Smaller file / site only accepts JPG | High | Yes | Choose background colour for transparency | **P1** |
| jpg to png | Often a *misunderstanding* (expecting transparency/quality) | High | Yes | Honest explanation + tool | **P1** |
| jpg/png to webp | Web developers/bloggers | Medium-high | Yes, WASM fallback for Safari | Works correctly on iPhone | **P1** |
| jpg to pdf / image to pdf | Submit photos/scans as one document | Very high | Yes (pdf-lib) | Original JPEG bytes embedded (no recompression), reorder, page size | **P1** |
| crop image | Cut to aspect ratio | High | Yes | Touch-friendly, aspect presets, exact pixel inputs | **P1** |
| rotate image / flip | Fix sideways photo | Medium | Yes | Batch | **P1 (cheap)** |
| exif viewer / remove exif / remove location from photo | Privacy before sharing, curiosity | Medium, low-quality competitors | Yes | **Lossless** removal for JPEG/PNG/WebP (no re-encode) — strongest fit with our privacy brand | **P1** |
| image converter (generic) | Hub page for all conversions | Very high | Yes | Hub that links to specific tools | **P1** |
| GIF maker / video to GIF | Fun/social | High (EZGIF) | Partly (video needs ffmpeg.wasm, heavy) | Later | Phase 5 |
| background remover | Product photos/profile pics | Very high (remove.bg, Canva) | Only with large in-browser ML models; licence + UX risk | Later, research | Phase 3+ |
| upscale image | Enlarge | High | ML models, heavy | Later | Phase 3+ |
| PDF merge/split/compress | Documents | Extremely high | Merge/split yes (pdf-lib); good compression is hard | Phase 4 |

### Decision: Phase-1 tool set (14 tools)

1. Image Compressor — `/tools/image-compressor`
2. Compress Image to a Target Size (KB) — `/tools/compress-image-to-kb`
3. Image Resizer — `/tools/image-resizer`
4. Image Converter (hub) — `/tools/image-converter`
5. HEIC to JPG — `/tools/heic-to-jpg`
6. WebP to JPG — `/tools/webp-to-jpg`
7. PNG to JPG — `/tools/png-to-jpg`
8. JPG to PNG — `/tools/jpg-to-png`
9. JPG/PNG to WebP — `/tools/image-to-webp`
10. Image to PDF (JPG to PDF) — `/tools/image-to-pdf`
11. Image Cropper — `/tools/image-cropper`
12. Rotate & Flip Image — `/tools/rotate-image`
13. EXIF / Photo Metadata Viewer — `/tools/exif-viewer`
14. Remove EXIF / Photo Metadata — `/tools/remove-exif`

Replaced/deferred from the original candidate list:
- **Separate "JPG to WebP" and "PNG to WebP" pages → merged** into one page. The workflow is identical; two
  near-duplicate pages would be thin/doorway-like.
- **"WebP to PNG"** is covered by the Image Converter hub (no separate page until data shows demand).
- **GIF Maker → Phase 5** (EZGIF is strong; building it well needs frame editing UI).
- **Per-size pages ("compress to 50KB", "compress to 100KB" …) are NOT created.** They would be near-identical
  doorway pages — a scaled-content risk. One target-size tool with presets serves all of them.

## 4. Target users

- People filling in online forms (passport/visa, exams, job portals, government sites) with strict size/format rules — mobile heavy, often in India/SE Asia/Africa.
- iPhone users whose HEIC photos are rejected by Windows apps or websites.
- Bloggers, small shop owners and web developers who need WebP, resizing and compression in batches.
- Privacy-conscious users sharing photos (strip GPS before posting/selling items online).
- Students/office workers turning phone photos into a single PDF.

Language: **English first** (largest search + ad market). Japanese and other languages are Phase 3 candidates
once English pages show traction (see roadmap).

## 5. Differentiation (USP)

"Free image tools. No account. Files stay on your device."

We only claim what the code guarantees:
- Every Phase-1 tool processes files with browser APIs / WebAssembly in the visitor's browser. There is no
  upload endpoint — the site is static.
- A strict CSP (`connect-src 'self'`, `form-action 'none'`) is served on every page, so even a bug or a
  compromised third-party script could not POST files to another origin.
- The methodology page explains exactly how each tool works, its limits, and how to verify there is no upload
  using browser developer tools.
- The only optional third-party request is Cloudflare Web Analytics (cookieless page-view counts), disclosed in
  the privacy policy. It never receives files.

Product differentiators: batch processing + ZIP, target-size compression, never-bigger output, correct WebP on
iPhone, lossless metadata removal, original-quality JPEG embedding in PDFs, honest per-tool limitations.

## 6. Monetization strategy

1. **Now:** no ads. Measure search impressions, CTR, tool completion, return visits.
2. **When a page has stable traffic (e.g. >30k monthly sessions site-wide):** apply for AdSense. Reserved,
   size-stable ad slots (`AdSlot` component placeholder) sit *below* the tool and between content sections so
   ads never push the tool down or cause layout shift. No ads inside the drop zone or result area; no
   interstitials; no ads on privacy/legal pages.
3. **Later options:** an ad-free supporter plan, higher batch limits for power users (still in-browser),
   B2B: white-label/embeddable widget or an offline desktop/PWA build. No feature that exists today will be
   moved behind a paywall.

Rough economics for the long-term goal: tool-site RPMs vary widely (roughly $2–$15 per 1,000 pageviews
depending on geography). $10k/month would need on the order of 1–3M monthly pageviews — Photopea-level
traffic is 12M visits. This is a multi-year goal and is not guaranteed.

## 7. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Head terms dominated by high-authority domains | Slow traffic growth | Long-tail intent (target KB, lossless EXIF removal, WebP on iPhone), genuinely better UX, earn links from privacy/dev communities |
| Brand name "QuickConvert" is already used by several unrelated tools (quickconvert.us, quickconvert.ink, tools.zuaqtech.com) | Brand confusion, possible trademark dispute, weak brand search | Name is centralised in `src/config/site.ts`; choose a distinctive name before buying a domain |
| HEIC/HEVC decoding: the decoder (libheif via `heic-to`, LGPL-3.0) is shipped as a separate file built from the unmodified library; HEVC is patent-encumbered | Licensing/patent exposure | LGPL notice + source link on `/about`; decoder isolated in one lazy module so it can be removed quickly; Safari uses the OS decoder |
| Browser memory limits (iOS canvas ≈16.7 MP) | Crashes on huge images | Header-based dimension checks before decoding, automatic safe downscale with a visible notice, clear errors |
| `pages.dev` subdomain without custom domain | Weaker brand/trust, harder to move later | Canonical host comes from `SITE_URL`; move to a custom domain early, with 301s |
| Scaled-content policy | Ranking loss | One page per distinct intent, hand-written content, no per-number doorway pages |
| Competitors copy features | Loss of edge | Speed of iteration, trust, breadth over time |

## 8. Growth strategy

1. Launch 14 tools, submit sitemap in Search Console, measure 4–8 weeks.
2. Double down on tools with impressions but low CTR (titles/descriptions) and tools with traffic but low
   completion (UX bugs).
3. Add adjacent tools where Search Console shows queries we already appear for (e.g. "webp to png",
   "passport photo size", "image to pdf on iphone").
4. Expand to PDF tools (merge/split/organize with pdf-lib — no upload), then GIF, then video/audio with
   ffmpeg.wasm when needed.
5. Localize the best-performing pages (Japanese, Spanish, Portuguese, Hindi, Indonesian) with real
   translations, not machine-generated thin copies.
6. Earn links honestly: open-source the code, write technical posts (e.g. "Why WebP export on iPhone is
   broken and how we fixed it"), list on privacy-tool directories.
