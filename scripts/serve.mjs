// Minimal static server that mimics Cloudflare Pages routing for local preview and E2E tests:
// "/foo" serves "foo.html", "/foo.html" redirects to "/foo", unknown paths serve 404.html with
// status 404, and headers from dist/_headers are applied (including the CSP header).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function parseHeaders(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { pattern: line.trim(), headers: [] };
      rules.push(current);
    } else if (current) {
      const i = line.indexOf(':');
      current.headers.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]);
    }
  }
  return rules;
}

const rules = parseHeaders(await readFile(join(ROOT, '_headers'), 'utf8').catch(() => ''));
const matches = (pattern, path) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`).test(path);

async function exists(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path.includes('\0')) {
    res.writeHead(400).end();
    return;
  }
  if (path.endsWith('.html')) {
    const clean = path === '/index.html' ? '/' : path.slice(0, -5);
    res.writeHead(308, { Location: clean + url.search }).end();
    return;
  }
  if (path !== '/' && path.endsWith('/')) {
    res.writeHead(308, { Location: path.slice(0, -1) + url.search }).end();
    return;
  }
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, safe === '/' ? 'index.html' : safe);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  let status = 200;
  if (!(await exists(file))) {
    if (await exists(`${file}.html`)) file = `${file}.html`;
    else {
      file = join(ROOT, '404.html');
      status = 404;
    }
  }
  const headers = { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' };
  const matchPath = url.pathname;
  for (const rule of rules) {
    if (!matches(rule.pattern, matchPath)) continue;
    for (const [k, v] of rule.headers) headers[k] = headers[k] && k.toLowerCase() === 'content-security-policy' ? `${headers[k]}, ${v}` : v;
  }
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : await readFile(file));
}).listen(PORT, () => console.log(`Serving dist/ on http://localhost:${PORT}`));
