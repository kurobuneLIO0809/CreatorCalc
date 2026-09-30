# Roadmap

Strategy: **only expand where demand is proven.** Each phase has an entry condition based on data, not dates.
No revenue or traffic figure in this file is a forecast.

## Phase 1 — Initial tools (done)

13 browser-only image tools (HEIC to JPG disabled for launch), trust pages, SEO foundation, tests, Cloudflare Pages setup (see README).

Launch tasks (owner: you, needs your accounts):
- [x] Brand name chosen: **Wrenfile** (trademark search still to do — launch-checklist.md).
- [ ] Create the Cloudflare Pages project, set `SITE_URL`, deploy, enable Web Analytics.
- [ ] Search Console: verify, submit sitemap, request indexing of the top 5 tools.
- [ ] Manual QA on a real iPhone (Safari) and Android (Chrome/Firefox) — see docs/testing.md "Not yet covered".
- [ ] Run `BASE_URL=https://<site> npm run test:e2e` against production.

## First 90 days after launch — measurement plan

Tools (all free): Google Search Console (GSC), Cloudflare Web Analytics (CWA, cookieless), the E2E suite
against production (`BASE_URL=… npm run test:e2e`). No ads, no extra trackers.

A weekly 30-minute review, written into a simple log (date, metric, value, decision):

| Metric | Where | How to read it | Action |
|---|---|---|---|
| **Indexed pages** | GSC → Pages | Expect 21 indexable URLs. "Discovered/crawled – not indexed" in weeks 1–4 is normal | After week 4, for each non-indexed tool page: compare with top-3 results, add missing substance, add 1–2 contextual internal links, re-request indexing. Never publish extra pages to compensate |
| **Pages generating impressions** | GSC → Performance → Pages | Which tools Google considers relevant | Pages with 0 impressions after 6 weeks → check indexing and whether the H1/title matches the way people phrase the task |
| **Impressions** | GSC, per page and query | Leading indicator (weeks 2–8) | Rising impressions + position > 20: content/depth problem, not a title problem |
| **Queries** | GSC → Queries (filter by page) | Real wording of intents; long tail appears first | Collect queries at positions 8–30 into a backlog; add the missing *feature* or *answer* on the existing page (e.g. "passport", "signature", "under 50kb") |
| **Clicks** | GSC | Lagging indicator (weeks 6–12) | Track week-over-week totals and per top-5 page |
| **CTR** | GSC, per page at comparable positions | CTR below ~2% at average position ≤ 10 means the snippet is weak | Rewrite title/description of one page at a time, note the date, compare 3–4 weeks before/after. Do not change many pages at once |
| **Returning users** | CWA gives visits/page views only (no user IDs by design); GSC branded queries; direct traffic in CWA | Branded searches and direct visits are the proxy for return use | If direct/branded traffic grows, prioritise UX polish of the top tools over new tools |
| **Core Web Vitals** | GSC → Core Web Vitals (needs traffic), Lighthouse locally | Must stay "Good" | Any regression blocks new features until fixed |
| **Errors** | GitHub issues, E2E against production | Real-world breakage (esp. Safari) | Fix before any growth work |

Milestones:
- **Day 0–7:** deploy, verify GSC, submit sitemap, request indexing for 5 key tools, run E2E against
  production, manual iPhone/Android test (launch-checklist.md).
- **Day 8–30:** indexing only. Do not rewrite titles yet (too little data). Fix bugs; write 1 genuinely
  useful article-style section or guide only if a query shows unmet need.
- **Day 31–60:** first CTR experiments on pages with ≥ 500 impressions; add features for top long-tail
  queries on existing pages.
- **Day 61–90:** decide the next tool from GSC query data (Phase 3 list), not from guesses. Review whether the
  HEIC page earns enough traffic to justify its risk (docs/strategy.md §11).

What we deliberately do **not** measure yet: per-user tracking, tool completion events, heatmaps (privacy and
simplicity). If needed later, add aggregate, file-free counters and disclose them in the privacy policy.

## Phase 2 — Expansion decision rules (from week 8)

The initial version stays small (13 tools). New tools are added **only** when Search Console data and a
competitor check justify them. These rules are implemented in `scripts/gsc/analyze.mjs` (unit-tested) so the
same data always produces the same decision.

### Monthly routine (≈1 hour)

1. Search Console → Performance → Search results → **Last 28 days** → Export → Download CSV. Unzip to
   `gsc-export/` (git-ignored).
2. `npm run gsc -- gsc-export > gsc-report.md` — produces the R2/R3/R4/R7 tables below.
3. Apply the rules in order. Write every decision (date, rule, query/page, action) in a short log so its
   effect can be checked 4–8 weeks later.

### Gates (all must be true before any new tool)

- **G1 Indexing:** ≥ 90% of indexable URLs are "Indexed" in the Pages report, and ≥ 8 weeks since launch.
- **G2 Stability:** no open bug on existing tools; Core Web Vitals "Good"; E2E suite green against production.
- **G3 Capacity:** at most **one** new tool per month, each with tests, hand-written content and a review
  8 weeks later.

### R1 — Improve before you add

If a query can be served by an existing tool (the script maps queries to tools by intent), the answer is
**never** a new page. Only when a task needs a different UI (different inputs/outputs) does it become a new
tool. Test: *"Would the tool itself look different?"* If only a preset, a sentence or a default differs, add it
to the existing page (e.g. "compress to 20kb" → preset chip, not a `/compress-image-to-20kb` page).

### R2 — Striking distance (positions 8–30)

Query mapped to an existing tool, **≥ 100 impressions / 28 days, average position 8–30**:
- Read the query literally and check whether the page fully answers it (feature, preset, sentence, FAQ).
- Add the missing piece to that page, change `updated` in `src/data/tools.ts`, request re-indexing.
- Re-check after 4–6 weeks. If position did not improve, compare with the top-3 results (R5) for what they
  cover that we do not.

### R3 — CTR below expectation

Page with **≥ 500 impressions / 28 days** and CTR below the band for its average position:

| Avg position | Minimum CTR (young site) |
|---|---|
| 1–3 | 10% |
| 4–7 | 4% |
| 8–10 | 2% |
| > 10 | not a title problem → use R2 |

Action: rewrite that page's `title` and `description` in `src/data/tools.ts` so they match the top queries
for that page (use the wording people actually search). One page at a time, no more than one change per page
per 4 weeks, and keep the note of the old/new text and date.

### R4 — New tool candidates

A cluster of queries that **no existing tool serves** becomes a candidate when it has **≥ 300 impressions /
28 days** or **≥ 3 distinct queries** (we are already being shown for it, which is the strongest demand
signal a new site gets). The script also flags known gaps explicitly (passport photo, background removal,
PDF merge/split) so they are never credited to the wrong tool.

A candidate is built only if it passes **all** checks:

1. **Feasible in the browser** at $0: no server, no paid API, a library with a compatible licence
   (MIT/Apache/BSD; LGPL only as a separate file; no GPL in the client bundle; no patent-encumbered codecs
   without a decision like strategy.md §11), acceptable memory on a phone.
2. **Competitor check (R5)** score ≥ 3.
3. **Distinct intent** (R1).
4. **Honest:** we can describe exactly what it does and its limits.

Priority among passing candidates:

```
priority = impressions_28d × fit × feasibility ÷ difficulty
fit          1.0 = same user as our current tools (forms, privacy, quick fixes), 0.5 = adjacent, 0.2 = different audience
feasibility  1.0 = small library, proven; 0.5 = large WASM or complex UI; 0.2 = experimental
difficulty   from R5: 1 (easy) … 3 (hard)
```

### R5 — Competitor check (manual, 15 minutes per query)

Search the main query in a private window (and on mobile). For the top 10 organic results, note:

| Question | Points |
|---|---|
| At least 2 of the top 10 are small/independent sites (not iLovePDF/Smallpdf/Adobe/Canva/Google) | +2 |
| Top results upload files to a server (we can offer a real privacy advantage) | +1 |
| Top results are slow, ad-heavy, have daily limits or watermarks | +1 |
| We can do something concretely better (batch, exact size, lossless, works on iPhone) | +1 |
| Top 3 are all major brands with dedicated tools **and** strong content | −2 |

Score ≥ 3 → build. 1–2 → build only if impressions ≥ 1,000 / 28 days. ≤ 0 → do not build; revisit in 3 months.
Never copy competitor text, UI or assets — note only what users get.

### R6 — Localization (ja, zh-Hans, ko, fr, it are live since 2026-09-30)

Measure each language separately (Search Console → Pages, filter URL contains `/ja/` etc.; compare with
Countries):

- **Keep and improve** a language when, after 8 weeks, its pages have ≥ 500 impressions/month: apply R1–R3 to
  its queries (they are different from the English ones — e.g. 「画像 圧縮 100kb」), and add local examples
  (Japanese 証明写真 sizes, Korean 증명사진 sizes, Italian fototessera 35×45).
- **Fix** a language whose CTR is < 50% of the English CTR at similar positions: have a native speaker rewrite
  the titles/descriptions first.
- **Withdraw** a language (remove it from `LOCALES`, 301 its URLs to English in `public/_redirects`) when it
  has < 100 impressions/month after 16 weeks — unmaintained translations are a quality risk.
- **Add** a new language only when **≥ 20% of a page's impressions** come from one non-English-speaking country
  for 2 consecutive months and CTR there is below the English average. Candidates: es, de, pt-BR.
  Translate the full page and UI; no machine-generated copies.

### R7 — Weak pages

An indexed page with **< 10 impressions / 28 days after 16 weeks**: first check indexing, title/H1 wording and
internal links; if still weak after another 8 weeks, merge it into the closest tool and 301-redirect the URL
(`public/_redirects`). Never keep adding pages to compensate for weak ones.

### R8 — Re-evaluating HEIC

HEIC is disabled at launch (strategy.md §11). If queries containing "heic"/"iphone photo" reach **≥ 1,000
impressions / 28 days** on existing pages, re-open the decision: re-check the licence/patent situation and
browser support (e.g. whether Chrome gains native HEIC), then decide explicitly.

### Current backlog (to be validated by the rules above, not built yet)

Passport/ID photo maker · PDF merge/split · PDF to JPG · WebP to PNG page · signature cleaner · GIF maker.

## Phase 3 — Expand proven categories (only via Phase 2 rules)

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

0. The initial public launch has **no ads**.
1. Update privacy policy, add a consent management platform where required (EEA/UK), then apply for AdSense.
   Choose a CMP with a free tier (Google's own "Privacy & messaging" CMP is free for AdSense publishers) — no paid services.
2. Fixed-height ad slots below the tool and between content sections only; none on legal pages; never inside
   the tool; measure CWV before/after.
3. After ≥ 28 days of ad data, compute the traffic actually needed from measured page RPM
   (`required pageviews = target revenue ÷ page RPM × 1000`, see strategy.md §6) — per country group and top page.
   Watch RPM by country and page; remove slots that hurt usability or Core Web Vitals.
4. Later: ad-free supporter option, higher batch limits for power users, embeddable widget / B2B licence.

## Phase 9 — Reinvestment after ¥500k/month

- Custom domain + brand protection, professional translation for top languages.
- Paid device testing (BrowserStack) and accessibility audit.
- Contract a designer for illustrations and a writer for technical guides.
- Build the next category with the best measured demand; consider a desktop/offline app for power users.

## Idea pool (not prioritised — each item must pass the Phase 2 rules first)

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
