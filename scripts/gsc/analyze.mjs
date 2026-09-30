// Search Console export analyzer (free, offline).
//
// Usage:
//   1. Search Console → Performance → Search results → last 28 days → Export → "Download CSV" (a zip).
//   2. Unzip it, e.g. into ./gsc-export/ (contains Queries.csv and Pages.csv). Do not commit it.
//   3. node scripts/gsc/analyze.mjs ./gsc-export > gsc-report.md
//
// The rules implemented here are documented in docs/roadmap.md ("Expansion decision rules").
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const THRESHOLDS = {
  /** R2: an existing page is worth improving for a query with at least this many impressions. */
  improveMinImpressions: 100,
  /** R2: "striking distance" positions. */
  strikingMin: 8,
  strikingMax: 30,
  /** R3: pages need this many impressions before CTR is judged. */
  ctrMinImpressions: 500,
  /** R4: an unmatched cluster becomes a new-tool candidate at this many impressions … */
  clusterMinImpressions: 300,
  /** … or when this many distinct queries share the same task. */
  clusterMinQueries: 3,
};

/** R3: minimum acceptable CTR by average position (conservative, for a young site). */
export function expectedCtr(position) {
  if (position <= 3) return 0.1;
  if (position <= 7) return 0.04;
  if (position <= 10) return 0.02;
  return 0; // beyond page 1, CTR is not a title problem
}

/** Minimal CSV parser (handles quotes and commas inside quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== '')) rows.push(row);
  return rows;
}

const num = (v) => Number(String(v).replace(/[%,\s]/g, '')) || 0;

/** Reads a GSC table (Queries.csv or Pages.csv): first column is the key. */
export function toRecords(rows) {
  const [, ...data] = rows;
  return data.map((r) => ({
    key: r[0].trim(),
    clicks: num(r[1]),
    impressions: num(r[2]),
    ctr: num(r[3]) / 100,
    position: num(r[4]),
  }));
}

/**
 * Intent map: which existing tool answers a query. Order matters (first match wins).
 * Keep in sync with src/data/tools.ts when tools are added.
 */
export const INTENTS = [
  // Only size-limit phrasing; "passport photo size" (pixels/shape) is a different task.
  { tool: 'compress-image-to-kb', test: /\b\d+\s?kb\b|\bkb\b|under \d+\s?(kb|mb)|file size limit/ },
  // Only image → PDF; "merge pdf", "pdf to jpg", "compress pdf" are other (PDF-category) tasks.
  { tool: 'image-to-pdf', test: /(jpe?g|png|image|photo|picture|heic|webp|scan)s? (to|into|in) pdf|pdf from (image|photo|picture)s?/ },
  { tool: 'remove-exif', test: /(remove|delete|strip|clear|erase).*(exif|metadata|location|gps|geotag)|(exif|metadata|location|gps).*(remov|delet|strip)/ },
  { tool: 'exif-viewer', test: /exif|metadata|gps|location|camera info|date taken/ },
  { tool: 'heic-to-jpg', test: /heic|heif/ },
  { tool: 'webp-to-jpg', test: /webp to (jpg|jpeg|png)/ },
  { tool: 'image-to-webp', test: /(jpg|jpeg|png|image|to) ?webp|webp convert/ },
  { tool: 'png-to-jpg', test: /png to (jpg|jpeg)/ },
  { tool: 'jpg-to-png', test: /(jpg|jpeg) to png/ },
  { tool: 'image-cropper', test: /crop|cut|trim/ },
  { tool: 'rotate-image', test: /rotate|flip|mirror|upside|sideways/ },
  { tool: 'image-resizer', test: /resiz|dimension|pixel|px\b|scale|enlarge|\d+x\d+/ },
  { tool: 'image-compressor', test: /compress|reduce|shrink|optimi[sz]|smaller|tinypng/ },
  { tool: 'image-converter', test: /convert|converter|avif|bmp|gif to|to jpg|to png|format/ },
];

/** Tasks we know we do NOT serve yet, even if a keyword overlaps (they must surface as candidates). */
const KNOWN_GAPS = [/passport|visa photo|id photo|photo booth/, /background/, /merge|split|compress pdf|pdf to/];

export function classify(query) {
  const q = query.toLowerCase();
  const sizeLimit = INTENTS[0].test.test(q);
  if (!sizeLimit && KNOWN_GAPS.some((g) => g.test(q))) return null;
  return INTENTS.find((i) => i.test.test(q))?.tool ?? null;
}

/** Groups unmatched queries by their two most significant words (a cheap, transparent clustering). */
const STOP = new Set(['online', 'free', 'to', 'a', 'an', 'the', 'in', 'on', 'for', 'of', 'image', 'images', 'how', 'my', 'without', 'with', 'app', 'tool', 'best']);
export function clusterKey(query) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
  return words.slice(0, 2).sort().join(' ') || query.toLowerCase();
}

export function analyze(queries, pages, t = THRESHOLDS) {
  const improve = [];
  const unmatched = new Map();
  for (const q of queries) {
    const tool = classify(q.key);
    if (tool) {
      if (q.impressions >= t.improveMinImpressions && q.position >= t.strikingMin && q.position <= t.strikingMax) improve.push({ ...q, tool });
    } else {
      const k = clusterKey(q.key);
      const c = unmatched.get(k) ?? { cluster: k, queries: [], impressions: 0, clicks: 0 };
      c.queries.push(q);
      c.impressions += q.impressions;
      c.clicks += q.clicks;
      unmatched.set(k, c);
    }
  }
  const candidates = [...unmatched.values()]
    .filter((c) => c.impressions >= t.clusterMinImpressions || c.queries.length >= t.clusterMinQueries)
    .map((c) => ({ ...c, avgPosition: c.queries.reduce((n, q) => n + q.position * q.impressions, 0) / Math.max(1, c.impressions) }))
    .sort((a, b) => b.impressions - a.impressions);
  const ctr = pages
    .filter((p) => p.impressions >= t.ctrMinImpressions && p.ctr < expectedCtr(p.position))
    .map((p) => ({ ...p, expected: expectedCtr(p.position) }))
    .sort((a, b) => b.impressions - a.impressions);
  const noImpressions = pages.filter((p) => p.impressions === 0);
  return {
    improve: improve.sort((a, b) => b.impressions - a.impressions),
    ctr,
    candidates,
    noImpressions,
    totals: {
      queries: queries.length,
      impressions: queries.reduce((n, q) => n + q.impressions, 0),
      clicks: queries.reduce((n, q) => n + q.clicks, 0),
      pagesWithImpressions: pages.filter((p) => p.impressions > 0).length,
    },
  };
}

const pct = (v) => `${(v * 100).toFixed(1)}%`;

export function toMarkdown(r) {
  const out = [];
  out.push('# Search Console analysis', '');
  out.push(`Queries: ${r.totals.queries} · Impressions: ${r.totals.impressions} · Clicks: ${r.totals.clicks} · Pages with impressions: ${r.totals.pagesWithImpressions}`, '');
  out.push('## R2 — Improve existing pages (positions 8–30)', '', '| Query | Tool | Impr. | Pos. | Clicks |', '|---|---|---|---|---|');
  for (const q of r.improve) out.push(`| ${q.key} | ${q.tool} | ${q.impressions} | ${q.position.toFixed(1)} | ${q.clicks} |`);
  out.push('', '## R3 — Low CTR for position (rewrite title/description)', '', '| Page | Impr. | Pos. | CTR | Expected ≥ |', '|---|---|---|---|---|');
  for (const p of r.ctr) out.push(`| ${p.key} | ${p.impressions} | ${p.position.toFixed(1)} | ${pct(p.ctr)} | ${pct(p.expected)} |`);
  out.push('', '## R4 — New tool candidates (queries no existing tool answers)', '', 'Each needs the feasibility and competitor checks in docs/roadmap.md before any work starts.', '', '| Cluster | Impr. | Queries | Avg pos. | Examples |', '|---|---|---|---|---|');
  for (const c of r.candidates) out.push(`| ${c.cluster} | ${c.impressions} | ${c.queries.length} | ${c.avgPosition.toFixed(1)} | ${c.queries.slice(0, 3).map((q) => q.key).join('; ')} |`);
  out.push('', '## R7 — Pages with zero impressions', '');
  for (const p of r.noImpressions) out.push(`- ${p.key}`);
  return out.join('\n');
}

async function main(dir) {
  const read = async (name) => toRecords(parseCsv(await readFile(join(dir, name), 'utf8')));
  const [queries, pages] = await Promise.all([read('Queries.csv'), read('Pages.csv')]);
  console.log(toMarkdown(analyze(queries, pages)));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  if (!process.argv[2]) {
    console.error('Usage: node scripts/gsc/analyze.mjs <folder with Queries.csv and Pages.csv>');
    process.exit(1);
  }
  await main(process.argv[2]);
}
