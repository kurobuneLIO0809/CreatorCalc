import { useCallback, useState } from 'preact/hooks';
import { Dropzone } from '../components/tool-ui/Dropzone';
import { formatBytes } from '../lib/bytes';
import { formatLabel, type DetectedFormat } from '../lib/format';
import { copyText, downloadBlob } from '../services/download';
import { inspectFile, InputError } from '../services/engine';
import { outputName } from '../lib/filename';

const ACCEPT: DetectedFormat[] = ['jpeg', 'png', 'webp', 'heic', 'avif', 'tiff'];

const GROUP_LABELS: Record<string, string> = {
  ifd0: 'Image (IFD0)',
  exif: 'Camera settings (EXIF)',
  gps: 'GPS location',
  interop: 'Interoperability',
  ifd1: 'Thumbnail (IFD1)',
  xmp: 'XMP',
  iptc: 'IPTC',
  icc: 'Colour profile (ICC)',
  jfif: 'JFIF',
  ihdr: 'PNG header',
};

type Tags = Record<string, unknown>;

interface Report {
  fileName: string;
  size: number;
  format: DetectedFormat;
  width?: number;
  height?: number;
  groups: Array<{ id: string; label: string; rows: Array<[string, string]> }>;
  gps?: { latitude: number; longitude: number };
  summary: Array<[string, string]>;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) return `(binary data, ${value.byteLength} bytes)`;
  if (Array.isArray(value)) return value.length > 16 ? `(${value.length} values)` : value.map(formatValue).join(', ');
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : String(Math.round(value * 1e6) / 1e6);
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value);
      return json.length > 300 ? `${json.slice(0, 300)}…` : json;
    } catch {
      return '(complex value)';
    }
  }
  const text = String(value);
  return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

function pick(groups: Record<string, Tags>, ...keys: string[]): unknown {
  for (const g of Object.values(groups)) for (const k of keys) if (g && g[k] !== undefined && g[k] !== '') return g[k];
  return undefined;
}

async function analyse(file: File): Promise<Report> {
  const info = await inspectFile(file, ACCEPT);
  const exifr = (await import('exifr')).default;
  let groups: Record<string, Tags> = {};
  try {
    groups =
      ((await exifr.parse(file, {
        tiff: true,
        ifd0: true,
        exif: true,
        gps: true,
        interop: true,
        ifd1: true,
        xmp: true,
        iptc: true,
        icc: true,
        jfif: true,
        ihdr: true,
        makerNote: false,
        userComment: true,
        mergeOutput: false,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
        sanitize: true,
      } as never)) as Record<string, Tags> | undefined) ?? {};
  } catch {
    groups = {};
  }
  let gps: Report['gps'];
  try {
    const coords = await exifr.gps(file);
    if (coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) gps = { latitude: coords.latitude, longitude: coords.longitude };
  } catch {
    // no GPS
  }
  const out: Report['groups'] = [];
  for (const [id, tags] of Object.entries(groups)) {
    if (!tags || typeof tags !== 'object') continue;
    const rows = Object.entries(tags)
      .map(([k, v]) => [k, formatValue(v)] as [string, string])
      .filter(([, v]) => v !== '');
    if (rows.length) out.push({ id, label: GROUP_LABELS[id] ?? id.toUpperCase(), rows });
  }
  const summary: Array<[string, string]> = [];
  const add = (label: string, v: unknown) => {
    const s = formatValue(v);
    if (s) summary.push([label, s]);
  };
  add('Camera', [pick(groups, 'Make'), pick(groups, 'Model')].filter(Boolean).join(' '));
  add('Lens', pick(groups, 'LensModel', 'Lens'));
  add('Date taken', pick(groups, 'DateTimeOriginal', 'CreateDate', 'DateTime'));
  const exposure = pick(groups, 'ExposureTime');
  add('Exposure', typeof exposure === 'number' && exposure < 1 ? `1/${Math.round(1 / exposure)} s` : exposure ? `${exposure} s` : '');
  add('Aperture', pick(groups, 'FNumber') ? `f/${pick(groups, 'FNumber')}` : '');
  add('ISO', pick(groups, 'ISO', 'ISOSpeedRatings'));
  add('Focal length', pick(groups, 'FocalLength') ? `${pick(groups, 'FocalLength')} mm` : '');
  add('Software', pick(groups, 'Software'));
  add('Author / artist', pick(groups, 'Artist', 'creator', 'Creator', 'By-line'));
  add('Copyright', pick(groups, 'Copyright', 'rights'));
  return { fileName: file.name, size: file.size, format: info.format, width: info.width, height: info.height, groups: out, gps, summary };
}

export default function ExifViewerTool() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const onFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setReport(null);
    try {
      setReport(await analyse(file));
    } catch (e) {
      setError(e instanceof InputError ? e.message : 'This file could not be read. It may be damaged.');
    } finally {
      setBusy(false);
    }
  }, []);

  const asText = () => {
    if (!report) return '';
    const lines = [`File: ${report.fileName}`, `Format: ${formatLabel(report.format)}`, `Size: ${formatBytes(report.size)}`];
    if (report.gps) lines.push(`GPS: ${report.gps.latitude}, ${report.gps.longitude}`);
    for (const g of report.groups) {
      lines.push('', `[${g.label}]`);
      for (const [k, v] of g.rows) lines.push(`${k}: ${v}`);
    }
    return lines.join('\n');
  };

  const total = report?.groups.reduce((n, g) => n + g.rows.length, 0) ?? 0;

  return (
    <div class="tool">
      <Dropzone acceptAttr=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.tif,.tiff,image/*" multiple={false} compact={!!report} hint="JPG, HEIC, PNG, WebP, AVIF, TIFF · the photo is read on your device" onFiles={onFiles} title="Drop a photo here" />
      <div class="visually-hidden" role="status" aria-live="polite">
        {busy ? 'Reading metadata…' : report ? `${total} metadata fields found.` : ''}
      </div>
      {busy && <p class="muted">Reading metadata…</p>}
      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}
      {report && (
        <div class="exif">
          <div class="exif__head">
            <p class="result__name">{report.fileName}</p>
            <p class="result__meta">
              <span>{formatLabel(report.format)}</span>
              <span>{formatBytes(report.size)}</span>
              {report.width && report.height && (
                <span>
                  {report.width} × {report.height} px
                </span>
              )}
              <span>{total} fields</span>
            </p>
          </div>

          {report.gps ? (
            <div class="notice notice--warn">
              <strong>This photo contains its GPS location:</strong> {report.gps.latitude.toFixed(6)}, {report.gps.longitude.toFixed(6)}.{' '}
              Anyone you send the original file to can see where it was taken.{' '}
              <a href={`https://www.openstreetmap.org/?mlat=${report.gps.latitude.toFixed(6)}&mlon=${report.gps.longitude.toFixed(6)}#map=16/${report.gps.latitude.toFixed(6)}/${report.gps.longitude.toFixed(6)}`} target="_blank" rel="noopener noreferrer nofollow">
                View on OpenStreetMap
              </a>{' '}
              (opens openstreetmap.org and shares only these coordinates).
            </div>
          ) : (
            <p class="notice notice--good">No GPS location found in this file.</p>
          )}

          {report.summary.length > 0 && (
            <dl class="exif__summary">
              {report.summary.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div class="tool__actions">
            <a class="btn btn--primary" href="/tools/remove-exif">
              Remove this metadata
            </a>
            <button type="button" class="btn btn--secondary" onClick={async () => { await copyText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? 'Copied!' : 'Copy as text'}
            </button>
            <button
              type="button"
              class="btn btn--secondary"
              onClick={() => downloadBlob(new Blob([JSON.stringify({ file: report.fileName, gps: report.gps ?? null, metadata: Object.fromEntries(report.groups.map((g) => [g.id, Object.fromEntries(g.rows)])) }, null, 2)], { type: 'application/json' }), outputName(report.fileName, 'json', 'metadata'))}
            >
              Download JSON
            </button>
            <button type="button" class="btn btn--ghost" onClick={() => { setReport(null); setError(null); }}>
              Start over
            </button>
          </div>

          {report.groups.length === 0 && <p class="muted">No EXIF, XMP or IPTC metadata was found in this file.</p>}
          {report.groups.map((g) => (
            <details class="exif__group" key={g.id} open={g.id === 'ifd0' || g.id === 'exif' || g.id === 'gps'}>
              <summary>
                {g.label} <span class="muted">({g.rows.length})</span>
              </summary>
              <div class="table-wrap">
                <table class="data-table">
                  <tbody>
                    {g.rows.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
