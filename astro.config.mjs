// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { tools } from './src/data/tools.ts';

/**
 * Canonical origin of the production site. Set SITE_URL in the Cloudflare Pages
 * project settings (e.g. https://quickconvert.pages.dev or a custom domain).
 */
const SITE_URL = (process.env.SITE_URL || 'https://quickconvert.pages.dev').replace(/\/+$/, '');

/**
 * Cloudflare Web Analytics (cookieless) can be enabled in the Cloudflare dashboard.
 * Its beacon must be allowed by the CSP. Set CF_WEB_ANALYTICS=off to remove it from the policy.
 */
const analyticsEnabled = process.env.CF_WEB_ANALYTICS !== 'off';

const scriptSources = ["'self'", "'wasm-unsafe-eval'"];
const connectSources = ["'self'"];
if (analyticsEnabled) {
  scriptSources.push('https://static.cloudflareinsights.com');
  connectSources.push('https://cloudflareinsights.com');
}

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  integrations: [
    preact(),
    sitemap({
      filter: (page) => !/\/404(\.html)?$/.test(page),
      // lastmod only where we track real content changes (tool registry), never the build date.
      serialize(item) {
        const slug = new URL(item.url).pathname.match(/^\/tools\/([a-z0-9-]+)$/)?.[1];
        const tool = tools.find((t) => t.slug === slug);
        if (tool) item.lastmod = tool.updated;
        return item;
      },
    }),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        `connect-src ${connectSources.join(' ')}`,
        "img-src 'self' blob: data:",
        "media-src 'self' blob:",
        "worker-src 'self' blob:",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: {
        resources: scriptSources,
      },
    },
  },
  vite: {
    build: {
      // Keep WASM and worker files as separate cacheable assets.
      assetsInlineLimit: 0,
      // The HEIC decoder (~2.9 MB raw, ~0.7 MB gzip) is lazily loaded only when a HEIC file is opened.
      chunkSizeWarningLimit: 3200,
    },
    worker: {
      format: 'es',
    },
  },
});
