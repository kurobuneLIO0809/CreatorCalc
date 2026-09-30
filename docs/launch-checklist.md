# Launch checklist (things only you can do)

Everything in the repository is ready to build and deploy. The steps below need your accounts or your
decision. Nothing here costs money. Do them in order.

## A. Decisions before launch

- [x] **Brand name: Wrenfile** (set in `src/config/site.ts`, OG images regenerated, `wrangler.toml` name
      `wrenfile`). Still to do yourself: a trademark search (USPTO, EUIPO, J-PlatPat) and, if you want a
      domain later, check `wrenfile.com` / `.app` at a registrar (DNS showed no records for `wrenfile.com` and
      `wrenfile.app` on 2026-09-30 — not a guarantee they are free). Buying a domain is optional; the free
      `*.pages.dev` subdomain works.
- [ ] Create the Cloudflare project with the name `wrenfile` if available (→ `https://wrenfile.pages.dev`).
      If that name is taken, Cloudflare assigns another subdomain — use exactly that URL for `SITE_URL`.
- [x] **HEIC decoder: disabled** (`features.heicDecoder = false`). HEIC files get a clear message, the
      decoder is not shipped (checked at build), the HEIC to JPG page and HEIC claims are removed. Revisit with
      roadmap rule R8.
- [ ] **Contact channel.** `site.contactUrl` points to the GitHub issue tracker. If the repository is
      private, visitors cannot open issues — make it public, or set up a free email alias (e.g. Cloudflare
      Email Routing on a custom domain, or a free mailbox) and change the contact page.
- [ ] **Translations (ja, zh-Hans, ko, fr, it).** Written by hand for this project, not per-page machine
      output, but **not yet reviewed by native speakers**. Before promoting a language, have someone read
      its home page, the compressor and "compress to KB" pages and the tool UI (e.g. `/ja/tools/image-compressor`
      with a file added). Fix wording in `src/i18n/{ui,site,content}/<locale>.ts`. If you do not want a
      language at launch, remove it from `LOCALES` in `src/i18n/locales.ts` (and from the sitemap map in
      `astro.config.mjs`) — nothing else needs to change.
- [ ] **Legal pages.** Read `/privacy` and `/terms` yourself. They are written to match the code but are not
      legal advice; adjust for your country (e.g. operator name/address requirements in Japan or the EU).

## B. Local final check (≈10 minutes)

```bash
npm ci
SITE_URL=https://wrenfile.pages.dev npm run build   # must end with "postbuild: OK"
npm test && npm run check
npx playwright install chromium    # once, outside Claude cloud sessions
npm run test:e2e
```

## C. Cloudflare Pages (free plan)

- [ ] Cloudflare dashboard → Workers & Pages → Create → Pages → **Connect to Git** → this repository.
- [ ] Production branch: `main` (merge the work branch first, or set `PRODUCTION_BRANCH` to your branch name).
- [ ] Build command `npm run build`, output directory `dist`, root directory empty.
- [ ] Environment variables (Production):
  - [ ] `SITE_URL` = `https://<project>.pages.dev` (exact URL, no trailing slash) — **required**, the build fails
        without it
  - [ ] `CF_WEB_ANALYTICS` = `off` only if you will **not** enable Web Analytics
- [ ] Deploy and open the site. Check: home loads, a tool works, `/robots.txt` shows `Allow: /` and the sitemap
      line, `/sitemap-index.xml` lists your `SITE_URL`.
- [ ] Optional: Pages project → Metrics → enable **Web Analytics** (free, cookieless).
- [ ] Check a preview deployment of another branch returns `noindex` (view source → `<meta name="robots">`).

## D. Verify production

- [ ] `BASE_URL=https://<project>.pages.dev npm run test:e2e` — all tests must pass.
- [ ] Response headers (`curl -I https://<project>.pages.dev/tools/image-compressor`): `content-security-policy`
      with `frame-ancestors 'none'`, `x-content-type-options: nosniff`.
- [ ] Lighthouse (Chrome DevTools, mobile) on `/` and one tool: all categories ≥ 90.

## E. Real devices (cannot be automated here)

- [ ] **iPhone Safari:** pick a photo from the Photos library in Compress-to-KB (iOS should hand over a JPG; if it passes HEIC, the "not supported yet" message must appear); JPG → WebP (file must be `.webp` and open);
      compress a 48 MP photo if available (should show "reduced to fit memory" note, not crash); download and
      ZIP save to Files; crop by dragging handles; dark mode.
- [ ] **Android Chrome:** same flows.
- [ ] **Desktop Firefox:** one converter, crop, image to PDF.
- [ ] Report anything broken as an issue before announcing the site.

## F. Google Search Console (free)

- [ ] Add a **URL-prefix** property for `https://<project>.pages.dev/` (domain properties need DNS access,
      which `pages.dev` does not give you). Verify with the HTML tag or HTML file method:
  - HTML file: put the file Google gives you into `public/` and redeploy.
  - HTML tag: add the `<meta name="google-site-verification" …>` tag to `src/layouts/BaseLayout.astro` `<head>`.
- [ ] Submit `sitemap-index.xml`.
- [ ] URL Inspection → Request indexing for: compress-image-to-kb, image-compressor, image-to-pdf,
      remove-exif, webp-to-jpg.
- [ ] Start the weekly review from docs/roadmap.md ("First 90 days").

## G. Do NOT do at launch

- No ads, no AdSense application (Phase 8 in the roadmap).
- No paid tools or services.
- No extra pages created just for keywords.
