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

**Revenue model — measured, not assumed.** We deliberately do not state a fixed pageview target.
Ad RPM (revenue per 1,000 pageviews) for tool sites varies by an order of magnitude with country mix,
device mix, ad placement and season, so any number chosen before launch would be a guess. Once ads run
(Phase 8), compute from our own data:

```
required monthly pageviews = target monthly revenue ÷ (measured page RPM ÷ 1000)
measured page RPM          = ad revenue in period ÷ pageviews in period × 1000   (from AdSense "Page RPM")
```

Use at least 28 days of data, compute it per country group and per top page, and recompute monthly.
Example of the calculation only (not a forecast): with a measured page RPM of R USD and a target of T USD,
the requirement is T ÷ R × 1000 pageviews. Until then, progress is tracked with traffic and engagement
metrics (docs/roadmap.md, "First 90 days").

## 7. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Head terms dominated by high-authority domains | Slow traffic growth | Long-tail intent (target KB, lossless EXIF removal, WebP on iPhone), genuinely better UX, earn links from privacy/dev communities |
| Brand name "QuickConvert" is used by at least 7 unrelated file-conversion products (see §9) | Brand confusion, possible trademark dispute, weak brand search | Rename before launch/domain purchase; the name lives in `src/config/site.ts` (+ `npm run og`) |
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

## 9. Brand name review (2026-09-30)

### Findings for "QuickConvert"

Same-name products found in web search, all in *file/image conversion* — the exact category we are in:
quickconvert.co (AI image/PDF/OCR converter), quickconvert.us (browser image converter with a paid tier),
quickconvert.ink (Chrome extension, "no uploads" — the same pitch as ours), a QuickConvert Chrome Web Store
extension, a macOS app "QuickConvert: File Converter", two Android apps and a Microsoft Store app
("Any Image Converter PRO – QuickConvert"). quickconvert.com / .app / .io all resolve (registered).

**Risk: high.** Brand searches would be split between unrelated products, reviews/links could be
misattributed, and at least one of these owners could hold or apply for a trademark in the software class.
Recommendation: **do not launch under QuickConvert.**

### Method and its limits

- Domain check: DNS resolution of `.com` and `.app` (RDAP/WHOIS services are blocked by this environment's
  network policy). "Resolves" = certainly registered; "no DNS" = *probably* unregistered but could be
  registered without DNS or reserved/premium. **Verify at a registrar before deciding.**
- Conflict check: web search for the exact name. A trademark search (USPTO TESS, EUIPO eSearch, J-PlatPat)
  has not been done and should be done by you for the final choice.

### 20 name ideas

Criteria: easy to say and spell after hearing it once, 2 syllables, not descriptive-generic, not limited to
"convert" (future PDF/video tools), no obvious conflicts.

| # | Name | .com (DNS) | .app (DNS) | Notes |
|---|---|---|---|---|
| 1 | **Pixwren** | no DNS | no DNS | "pix" + wren (small, quick bird); no conflicts found |
| 2 | **Pixfinch** | no DNS | no DNS | same idea; no conflicts found |
| 3 | **Nookpix** | no DNS | no DNS | "a little corner for your pictures"; no conflicts found |
| 4 | **Pixlark** | no DNS | no DNS | only a GitHub username found |
| 5 | **Wrenfile** | no DNS | no DNS | category-neutral (works for PDF/video later) |
| 6 | Pixlocal | no DNS | no DNS | literal "local processing"; a small pixlocal.ru project exists |
| 7 | Imgstay | no DNS | no DNS | "images stay on your device"; awkward to say |
| 8 | Pixhearth | no DNS | no DNS | harder to spell |
| 9 | Pixmoss | no DNS | no DNS | |
| 10 | Pixfern | no DNS | no DNS | |
| 11 | Owlfile | no DNS | no DNS | category-neutral |
| 12 | Fixpixly | no DNS | no DNS | hard to spell |
| 13 | Pixnestle | no DNS | no DNS | too long |
| 14 | Tidypic | registered | no DNS | .com taken |
| 15 | Pixnook | registered | no DNS | .com taken |
| 16 | Pixshelf | registered | no DNS | .com taken |
| 17 | Tidyframe | no DNS | no DNS | existing CMS and Python library of the same name |
| 18 | Pixcove | registered | no DNS | .com taken |
| 19 | Clearpix | registered | registered | taken |
| 20 | Snapfix | registered | registered | taken, existing app |

### Shortlist (5)

1. **Pixwren** — short, distinctive, pronounceable in English and Japanese (ピクスレン), no conflicts found.
2. **Pixfinch** — same qualities; slightly more common word parts.
3. **Nookpix** — friendly, implies "your own private corner".
4. **Pixlark** — easy, but a developer handle with the same name exists.
5. **Wrenfile** — best if the site will soon be more about PDFs/video than images.

Recommendation: **Pixwren** (or Wrenfile if you want to be category-neutral), after a registrar check and a
trademark search. **No domain has been purchased.** Renaming = change `site.name` in
`src/config/site.ts`, run `npm run og`, rebuild.

## 10. Tool audit (2026-09-30)

Legend — Useful: real task with search demand. Safari risk: behaviour depends on WebKit specifics that could
not be tested on a real device. Memory: peak for a 12 MP photo (≈48 MB RGBA per full-size canvas).

| Tool | Useful / intent | Differentiation | Browser-only? | Mobile UX | Safari risk | Memory / large images | Verdict |
|---|---|---|---|---|---|---|---|
| Image Compressor | High / "compress image" | batch, compare, never-bigger | Yes | results-first | Low (JPEG native; WebP via WASM) | ~2 canvases; PNG quantization skipped > 20 MP | Keep |
| Compress to KB | High, long-tail, form users | exact byte budget, 1000-byte safe KB | Yes | presets as chips | Low | repeated encodes of one canvas; downscale steps | **Keep — strongest bet** |
| Image Resizer | High | batch, fit/stretch, no-upscale | Yes | fields in 2 columns | Low | output capped by canvas budget (16.7 MP iOS, 24 MP low-RAM, 50 MP desktop) | Keep |
| Image Converter | Medium (hub) | mixed batches, content sniffing | Yes | ok | TIFF only in Safari | as resizer | Keep (hub page) |
| HEIC to JPG | Very high | native on Safari, batch/ZIP | Yes (with bundled decoder) | ok | Medium: relies on Safari's createImageBitmap for HEIC; else slow JS decoder | full-size decode ×2 (ImageData + bitmap) → bigger than others; header size check added | Keep, see HEIC decision |
| WebP to JPG | High | background colour, PNG option | Yes | ok | Low | low | Keep (content enriched) |
| PNG to JPG | High | background colour | Yes | ok | Low | low | Keep |
| JPG to PNG | High, often misunderstood | honest explanation | Yes | ok | Low | PNG output large | Keep |
| JPG/PNG to WebP | Medium | correct WebP when Safari can't encode | Yes (WASM) | ok | Medium: untested on real iOS | WASM heap ≈ 2–3× image | Keep; title no longer claims iPhone |
| Image to PDF | Very high | JPG embedded unchanged, reorder | Yes | reorder buttons | Low | all images held until save; 400 MB guard | Keep |
| Image Cropper | High | touch handles + exact px | Yes | 40 px handles on touch | Low–medium (pointer capture on iOS 13+) | one image | Keep |
| Rotate & Flip | Medium | batch + preview | Yes | ok | Low | low | Keep |
| EXIF Viewer | Medium | GPS warning, local only | Yes | tables scroll | Low | reads headers only | Keep |
| Remove EXIF | Medium, privacy | **lossless**, lists what was removed | Yes (byte-level) | ok | Low | file size only | **Keep — brand-defining** |

No tool was removed: each has a distinct intent and works without a server. Changes made from this audit:
device-aware canvas budgets (low-RAM Android), HEIC/AVIF header size check before decoding, PNG quantization
cap, fix for Safari 16.0–16.3 (OffscreenCanvas without 2D), softened untested iPhone claim, richer WebP page.

## 11. HEIC decision (2026-09-30)

**Licence.** The decoder is `heic-to` 1.5.2, which bundles libheif and libde265 — both **LGPL-3.0**. Using an
LGPL library in a website is allowed if we (a) ship its licence text, (b) point to the corresponding source,
and (c) let users replace it. Now done: the decoder is a separate lazily-loaded file, and
`/third-party-licenses.txt` (generated at build, linked in the footer and methodology page) contains the
licence texts and source links for every client-side dependency.

**Patents.** HEIC photos use HEVC (H.265) compression, which is covered by patent pools (Access Advance,
Via LA and others). Shipping a *software HEVC decoder* in a free, ad-supported website is a grey area: many
popular sites do it and enforcement against free web decoders is not known, but it is **not risk-free and is
not something we can resolve technically**. Safari users are unaffected (Apple's licensed OS decoder is used).

**Compatibility.** Chrome, Edge and Firefox cannot decode HEIC natively on any OS; without the bundled decoder
the HEIC page would only work in Safari. Tested: real HEIC → JPG in Chromium, damaged HEIC fails cleanly,
HEIC inside Image to PDF. Not testable here: Safari's native path.

**Decision:** keep HEIC enabled for launch (it serves one of the largest search intents), with licence
compliance in place, and make it switchable: `features.heicDecoder = false` in `src/config/site.ts` removes the
HEIC to JPG page, its sitemap entry and all links to it, and makes other tools show a clear
"open it in Safari" message instead of loading the decoder. **You should decide** whether you accept the patent
grey area; if unsure, set the flag to `false` before launch (the rest of the site is unaffected).
