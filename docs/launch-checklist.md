# Launch checklist (things only you can do)

Everything in the repository is ready to build and deploy. The steps below need your accounts or your
decision. Nothing here costs money. Do them in order.

## A. Decisions before launch

- [ ] **Brand name.** "QuickConvert" collides with ≥ 7 same-category products (docs/strategy.md §9).
      Pick a name (shortlist: Pixwren, Pixfinch, Nookpix, Pixlark, Wrenfile), check it at a registrar and in a
      trademark database (USPTO, EUIPO, J-PlatPat). Then:
  - [ ] set `name` (and `tagline` if needed) in `src/config/site.ts`
  - [ ] run `npm run og` (regenerates OG images/icons with the new name) and commit
  - [ ] optionally rename the Cloudflare project (`name` in `wrangler.toml`)
  - Buying a domain is optional for launch; the free `*.pages.dev` subdomain works.
- [ ] **HEIC decoder** (docs/strategy.md §11): keep `features.heicDecoder = true`, or set it to `false`
      if you do not want to accept the HEVC patent grey area. If `false`, also review copy that mentions the
      bundled decoder in `src/data/content.ts` (compress-to-KB, converter, image-to-PDF pages).
- [ ] **Contact channel.** `site.contactUrl` points to the GitHub issue tracker. If the repository is
      private, visitors cannot open issues — make it public, or set up a free email alias (e.g. Cloudflare
      Email Routing on a custom domain, or a free mailbox) and change the contact page.
- [ ] **Legal pages.** Read `/privacy` and `/terms` yourself. They are written to match the code but are not
      legal advice; adjust for your country (e.g. operator name/address requirements in Japan or the EU).

## B. Local final check (≈10 minutes)

```bash
npm ci
SITE_URL=https://<project>.pages.dev npm run build   # must end with "postbuild: OK"
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

- [ ] **iPhone Safari:** HEIC → JPG from the Photos picker; JPG → WebP (file must be `.webp` and open);
      compress a 48 MP photo if available (should show "reduced to fit memory" note, not crash); download and
      ZIP save to Files; crop by dragging handles; dark mode.
- [ ] **Android Chrome:** same flows, plus HEIC → JPG (bundled decoder).
- [ ] **Desktop Firefox:** one converter, crop, image to PDF.
- [ ] Report anything broken as an issue before announcing the site.

## F. Google Search Console (free)

- [ ] Add a **URL-prefix** property for `https://<project>.pages.dev/` (domain properties need DNS access,
      which `pages.dev` does not give you). Verify with the HTML tag or HTML file method:
  - HTML file: put the file Google gives you into `public/` and redeploy.
  - HTML tag: add the `<meta name="google-site-verification" …>` tag to `src/layouts/BaseLayout.astro` `<head>`.
- [ ] Submit `sitemap-index.xml`.
- [ ] URL Inspection → Request indexing for: compress-image-to-kb, image-compressor, heic-to-jpg (if enabled),
      image-to-pdf, remove-exif.
- [ ] Start the weekly review from docs/roadmap.md ("First 90 days").

## G. Do NOT do at launch

- No ads, no AdSense application (Phase 8 in the roadmap).
- No paid tools or services.
- No extra pages created just for keywords.
