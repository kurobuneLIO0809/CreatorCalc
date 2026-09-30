# SEO design

_Last updated: 2026-09-30 (pre-launch audit)._

## Principles (from Google Search Central guidance)

Google's current guidance still centres on **helpful, people-first content**; the former "helpful content"
signals are part of the core ranking systems. The spam policies relevant to a tool site are:

- **Scaled content abuse** — many pages generated mainly to rank, with little value (regardless of whether
  AI or humans wrote them). → We publish **one page per distinct task**, each backed by a working tool.
  We deliberately did **not** create per-number pages (`compress-image-to-50kb`, `-100kb`, …) or
  near-duplicate pairs (`jpg-to-webp` + `png-to-webp`); see strategy.md §3.
- **Doorway abuse** — pages that funnel users to the same destination. → Every URL hosts its own tool UI and
  its own specifications/limits/FAQ.
- **Site reputation abuse / thin affiliate** — not applicable (no third-party content, no affiliate links).
- **AI-generated content** — allowed when it is helpful and accurate. All page copy is written for this
  site, describes behaviour that exists in the code, and is kept in one reviewable file
  (`src/data/content.ts`). Nothing is copied from competitors.
- **Page experience** — Lighthouse (mobile emulation, local): Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; LCP 1.1–1.5 s, CLS 0, TBT 0 ms. No layout shift from ads (none yet), no
  interstitials, no web fonts.

_Note: developers.google.com was not reachable from the build environment's network; the guidance above was
cross-checked through recent secondary summaries (2026) and should be re-read directly before launch._

## URL structure

| Path | Purpose |
|---|---|
| `/` | Home: value proposition, search, popular tools, grouped tools, privacy explanation, FAQ |
| `/tools` | All tools by category + planned categories |
| `/tools/<task-slug>` | One tool per search intent, lowercase, hyphenated, no dates or IDs |
| `/about`, `/methodology`, `/privacy`, `/terms`, `/contact` | Trust / E-E-A-T pages |

- No trailing slashes (`build.format: 'file'`, `trailingSlash: 'never'`). Cloudflare Pages serves
  `/tools/foo` from `tools/foo.html` and 308-redirects `/tools/foo.html` and `/tools/foo/` to the clean URL
  (verified with `wrangler pages dev`).
- Future categories get their own prefix-free slugs under `/tools/` (e.g. `/tools/merge-pdf`), keeping one
  flat, stable URL space; category hub pages can be added later (`/pdf-tools`) without moving tools.
- Unknown URLs return a real **404** status with a noindex page linking to popular tools.

## Per-page metadata

Implemented in `src/layouts/BaseLayout.astro` from the registry (`src/data/tools.ts`):

| Element | Implementation |
|---|---|
| `<title>` | Intent-first, ~50–60 chars ("Compress Image to 20KB, 50KB, 100KB or Any Size – Free"). Brand appended only when it fits |
| meta description | Unique, 120–160 chars, states the benefit + privacy angle |
| canonical | Absolute URL from `SITE_URL`, no trailing slash |
| robots | `index, follow, max-image-preview:large`; `noindex` on 404 and on all Cloudflare preview branches |
| Open Graph | type, site_name, locale, title, description, url, 1200×630 image per tool (`public/og/<slug>.png`), alt |
| Twitter/X | `summary_large_image`, title, description, image |
| theme-color, manifest, icons | light/dark theme-color, `site.webmanifest`, SVG + PNG icons |
| `lang` | `en` |

`scripts/postbuild.mjs` fails the build if any indexable page lacks title/description/canonical/OG tags,
has more than one `<h1>`, duplicates another page's title or description, or references a missing OG image.

### Tool pages — title / H1 / primary intent

| Slug | Title | Primary intent |
|---|---|---|
| image-compressor | Compress Images Online – JPG, PNG & WebP, No Upload | compress image, reduce image size |
| compress-image-to-kb | Compress Image to 20KB, 50KB, 100KB or Any Size – Free | compress image to 100kb / 50kb / 20kb |
| image-resizer | Resize Image Online – Change Pixels or Percentage, Free | resize image, change image size in pixels |
| image-converter | Image Converter – HEIC, WebP, PNG, JPG, AVIF Online | image converter, convert image format |
| heic-to-jpg | HEIC to JPG Converter – Free, Batch, No Upload | heic to jpg |
| webp-to-jpg | WebP to JPG Converter – Free Online, Batch, No Upload | webp to jpg (+ webp to png) |
| png-to-jpg | PNG to JPG Converter – Choose Background, Free & Private | png to jpg |
| jpg-to-png | JPG to PNG Converter – Free, Lossless Output, No Upload | jpg to png |
| image-to-webp | JPG & PNG to WebP Converter – Works on iPhone Too | jpg to webp, png to webp |
| image-to-pdf | JPG to PDF – Combine Images into One PDF, Free & Private | jpg to pdf, image to pdf |
| image-cropper | Crop Image Online – Square, 16:9, 4:5 or Custom, Free | crop image |
| rotate-image | Rotate Image Online – Rotate 90°/180° or Flip, Free | rotate image, flip image |
| exif-viewer | EXIF Viewer – Check Photo Metadata & GPS Location Online | exif viewer, photo metadata, check location |
| remove-exif | Remove EXIF Data & Location from Photos – Lossless, Free | remove exif, remove location from photo |

### On-page content structure (every tool page)

H1 → one-sentence tagline → privacy badge → **the tool (above the fold)** → About → How to use (ordered
steps) → When it helps (3 real use cases) → Specifications table (formats, method, limits) → Limitations →
FAQ (`<details>`) → Related tools. Content lives in `src/data/content.ts`; the TypeScript type forces every
section so no page ships thin.

## Structured data (JSON-LD)

| Page | Types | Notes |
|---|---|---|
| Home | `WebSite`, `Organization` | No `SearchAction` (site search is client-side only) |
| Tool pages | `WebApplication` (free `Offer`, `isAccessibleForFree`, browser requirements), `BreadcrumbList` | No `aggregateRating` — we never invent ratings |
| /tools, legal pages | `BreadcrumbList` | |

Deliberately **not** used: `FAQPage` (FAQ rich results are limited to authoritative government/health sites
since 2023, so markup adds no value), `HowTo` (rich result deprecated). JSON-LD is serialized with `<`
escaped to prevent script-breaking injection.

## sitemap.xml & robots.txt

- `@astrojs/sitemap` generates `/sitemap-index.xml` → `/sitemap-0.xml` with every indexable page (404
  excluded). `lastmod` is emitted **only** for tool pages, from the `updated` field of the registry — never
  the build time, so Google can trust it.
- `/robots.txt` (generated) allows everything and points to the sitemap. On preview branches it returns
  `Disallow: /`.

## Internal linking strategy

- Header: All tools, How it works, Privacy. Footer: all popular tools + site pages (every page links to the
  money pages).
- Home: popular tools + grouped list of all tools (task groups: compress & resize / convert / edit & combine /
  privacy).
- Each tool page links to 4 hand-picked **related tools** chosen by user journey, e.g. HEIC to JPG →
  Compress to KB (forms), Remove EXIF (privacy), Image to PDF (documents).
- Contextual links in content (e.g. EXIF Viewer ↔ Remove EXIF, converter hub ↔ specific converters,
  every tool → methodology).
- Breadcrumbs (Home › Tools › Tool) with `BreadcrumbList` markup.

## Search Console launch checklist

1. Set `SITE_URL`, deploy, verify a URL-prefix property (HTML tag/file method on `*.pages.dev`).
2. Submit `sitemap-index.xml`; request indexing for the 5 most important tools.
3. After 2–4 weeks: Pages report (indexed vs "Crawled – currently not indexed"), Performance by page and
   query, Core Web Vitals report.
4. Iterate titles/descriptions for pages with impressions but CTR < 2%; add content/features for queries
   where we rank 8–30 (see roadmap Phase 2).

## Known SEO risks

- New domain on a shared `pages.dev` subdomain: slow initial trust; moving to a custom domain later needs
  301s — do it early.
- Head terms are dominated by very strong domains; growth depends on long-tail intents and links.
- Brand name collision ("QuickConvert") weakens branded search.
- English only for now; localization must be real translation with local examples, not machine-duplicated
  pages.

## Pre-launch audit (2026-09-30)

Guidance re-checked via 2026 coverage of Google's March, June, August and September 2026 spam updates: they
enforce the existing policies (scaled content abuse, expired-domain and site-reputation abuse) more strictly;
"people-first" content and non-commodity value remain the standard. developers.google.com itself was not
reachable from this environment — re-read the primary pages before launch.

| Check | Method | Result |
|---|---|---|
| Thin content | Main-content word count per page | Tool pages 485–888 words of task-specific text *plus* a working tool; thinnest (WebP to JPG) was enriched with two practical answers. Contact/404 are short by nature (404 is noindex) |
| Duplicate content | 5-word-shingle Jaccard similarity between all tool pages | Max 0.16 (WebP→JPG vs PNG→JPG), caused by shared spec rows and related links. No near-duplicates |
| Pages made only for ranking | Manual review | None: every URL has its own working tool and distinct intent; no per-number or per-city pages; planned categories are text on /tools, not empty pages |
| canonical | E2E: canonical path equals request path on all 21 pages | OK; production build refuses to run without `SITE_URL` |
| noindex | 404 and preview branches noindex; all others indexable | OK |
| sitemap | E2E + wrangler | 21 URLs, 404 excluded, lastmod only from the registry, disabled tools removed automatically |
| 404 | E2E + `wrangler pages dev` | Real 404 status, `.html` and trailing-slash URLs 308 to the canonical URL |
| Internal links | New post-build check | 0 broken links, no links to `.html` URLs |
| Titles / descriptions | Post-build length + uniqueness check | All unique; titles 22–63 chars, descriptions 131–166 chars |
| Unverifiable claims | Manual review | "Works on iPhone Too" removed from a title (not device-tested) |
