import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: `${site.name} — free in-browser image tools`,
        short_name: site.name,
        start_url: '/',
        display: 'standalone',
        background_color: '#f6f7f9',
        theme_color: '#0d7a6f',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
