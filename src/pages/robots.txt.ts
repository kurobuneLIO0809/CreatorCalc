import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.toString() ?? '').replace(/\/+$/, '');
  const branch = process.env.CF_PAGES_BRANCH;
  const isPreview = !!branch && branch !== (process.env.PRODUCTION_BRANCH || 'main');
  const body = isPreview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
