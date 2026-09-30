import { t, withI18n } from '../i18n/runtime';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { limits, site } from '../config/site';
import { Dropzone } from '../components/tool-ui/Dropzone';
import { Segmented, Select } from '../components/tool-ui/fields';
import { formatBytes } from '../lib/bytes';
import { outputName, sanitizeBaseName } from '../lib/filename';
import { formatLabel } from '../lib/format';
import { readJpegOrientation } from '../lib/metadata/jpeg';
import { computePlacement, type MarginId, type PageOrientation, type PageSizeId } from '../lib/pdf-layout';
import { downloadBlob } from '../services/download';
import { abortError, ImageEngine, InputError, inspectFile, isAbort, type InputInfo } from '../services/engine';
import { RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS } from './shared';

interface Page {
  id: string;
  file: File;
  info?: InputInfo;
  error?: string;
  thumb?: string;
}

let seq = 0;

function ImageToPdfTool() {
  const [pages, setPages] = useState<Page[]>([]);
  const [size, setSize] = useState<PageSizeId>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('auto');
  const [margin, setMargin] = useState<MarginId>('small');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<{ blob: Blob; name: string; pages: number } | null>(null);
  const engine = useRef<ImageEngine | null>(null);
  const abort = useRef<AbortController | null>(null);
  const pagesRef = useRef<Page[]>([]);
  pagesRef.current = pages;

  useEffect(
    () => () => {
      abort.current?.abort();
      engine.current?.terminate();
      pagesRef.current.forEach((p) => p.thumb && URL.revokeObjectURL(p.thumb));
    },
    [],
  );

  const settingsKey = `${size}|${orientation}|${margin}|${pages.map((p) => p.id).join(',')}`;
  useEffect(() => setPdf(null), [settingsKey]);

  const onFiles = useCallback(async (files: File[]) => {
    setError(null);
    const room = limits.maxBatchFiles - pagesRef.current.length;
    if (files.length > room) setError(t('pdf.tooMany', { max: limits.maxBatchFiles }));
    const added: Page[] = [];
    for (const file of files.slice(0, Math.max(0, room))) {
      const page: Page = { id: `p${seq++}`, file };
      try {
        page.info = await inspectFile(file, RASTER_INPUTS);
        // Thumbnails use the browser's decoder; HEIC shows a placeholder in browsers that can't display it.
        if (page.info.format !== 'heic') page.thumb = URL.createObjectURL(file);
      } catch (e) {
        page.error = e instanceof InputError ? e.message : t('batch.unreadable');
      }
      added.push(page);
    }
    setPages((prev) => [...prev, ...added]);
  }, []);

  const move = (index: number, delta: number) => {
    setPages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const remove = (id: string) =>
    setPages((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p?.thumb) URL.revokeObjectURL(p.thumb);
      return prev.filter((x) => x.id !== id);
    });
  const reset = () => {
    abort.current?.abort();
    pages.forEach((p) => p.thumb && URL.revokeObjectURL(p.thumb));
    setPages([]);
    setPdf(null);
    setError(null);
  };

  const valid = pages.filter((p) => p.info && !p.error);

  const totalBytes = valid.reduce((n, p) => n + p.file.size, 0);
  const tooLarge = totalBytes > limits.maxCombinedBytes;

  const build = async () => {
    if (!valid.length || tooLarge) return;
    setBusy(true);
    setError(null);
    setPdf(null);
    const controller = new AbortController();
    abort.current = controller;
    setProgress({ done: 0, total: valid.length });
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      doc.setProducer(`${site.name} (in-browser)`);
      doc.setCreator(site.name);
      for (let i = 0; i < valid.length; i++) {
        if (controller.signal.aborted) throw abortError();
        const { file, info } = valid[i];
        let bytes = new Uint8Array(await file.arrayBuffer());
        let kind: 'jpg' | 'png';
        if (info!.format === 'jpeg' && readJpegOrientation(bytes) === 1) {
          kind = 'jpg'; // Original JPEG data is embedded as-is: no quality loss.
        } else if (info!.format === 'png' && !info!.animated) {
          kind = 'png';
        } else {
          // Other formats (and rotated JPEGs) are converted: lossless PNG for graphics, high-quality JPG for photos.
          engine.current ??= new ImageEngine();
          const lossless = info!.format === 'gif' || info!.format === 'bmp' || info!.format === 'png';
          const r = await engine.current.process(file, info!, { output: { format: lossless ? 'png' : 'jpeg', quality: 0.92 } }, controller.signal);
          bytes = new Uint8Array(await r.blob.arrayBuffer());
          kind = lossless ? 'png' : 'jpg';
        }
        let image;
        try {
          image = kind === 'jpg' ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        } catch {
          throw new Error(t('pdf.embedFail', { name: file.name }));
        }
        const place = computePlacement(image.width, image.height, size, orientation, margin);
        const page = doc.addPage([place.pageWidth, place.pageHeight]);
        page.drawImage(image, { x: place.x, y: place.y, width: place.width, height: place.height });
        setProgress({ done: i + 1, total: valid.length });
        await new Promise((r) => setTimeout(r, 0));
      }
      const out = await doc.save();
      const name = valid.length === 1 ? outputName(valid[0].file.name, 'pdf') : `${sanitizeBaseName(valid[0].file.name)}-and-${valid.length - 1}-more.pdf`;
      setPdf({ blob: new Blob([out as BlobPart], { type: 'application/pdf' }), name, pages: valid.length });
    } catch (e) {
      if (!isAbort(e)) setError(e instanceof Error ? e.message : t('pdf.failed'));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  return (
    <div class="tool">
      <Dropzone acceptAttr={RASTER_ACCEPT_ATTR} multiple compact={pages.length > 0} disabled={pages.length >= limits.maxBatchFiles} hint={t('dz.hintPdf', { formats: RASTER_HINT, max: limits.maxBatchFiles })} onFiles={onFiles} />
      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}
      {pages.length > 0 && (
        <>
          <ol class="pages" aria-label={t('pdf.order')}>
            {pages.map((p, i) => (
              <li class={`page-item${p.error ? ' page-item--error' : ''}`} key={p.id}>
                <span class="page-item__num" aria-hidden="true">
                  {p.error ? '!' : valid.indexOf(p) + 1}
                </span>
                <div class="page-item__thumb" aria-hidden="true">
                  {p.thumb ? <img src={p.thumb} alt="" loading="lazy" /> : <span>{p.info ? formatLabel(p.info.format) : ''}</span>}
                </div>
                <div class="page-item__body">
                  <p class="result__name">{p.file.name}</p>
                  <p class="result__meta">{p.error ? <span class="result__error">{p.error}</span> : <span>{formatBytes(p.file.size)}</span>}</p>
                </div>
                <div class="result__actions">
                  <button type="button" class="btn btn--icon btn--sm" onClick={() => move(i, -1)} disabled={i === 0 || busy} aria-label={t('pdf.up', { name: p.file.name })}>
                    ↑
                  </button>
                  <button type="button" class="btn btn--icon btn--sm" onClick={() => move(i, 1)} disabled={i === pages.length - 1 || busy} aria-label={t('pdf.down', { name: p.file.name })}>
                    ↓
                  </button>
                  <button type="button" class="btn btn--icon btn--sm" onClick={() => remove(p.id)} disabled={busy} aria-label={t('row.remove', { name: p.file.name })}>
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div class="tool__options">
            <Select<PageSizeId>
              label={t('pdf.pageSize')}
              value={size}
              onChange={setSize}
              options={[
                { value: 'a4', label: t('pdf.a4') },
                { value: 'letter', label: t('pdf.letter') },
                { value: 'image', label: t('pdf.sameAsImage') },
              ]}
            />
            {size !== 'image' && (
              <Segmented<PageOrientation>
                label={t('pdf.orientation')}
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: 'auto', label: t('pdf.auto') },
                  { value: 'portrait', label: t('pdf.portrait') },
                  { value: 'landscape', label: t('pdf.landscape') },
                ]}
              />
            )}
            <Segmented<MarginId>
              label={t('pdf.margin')}
              value={margin}
              onChange={setMargin}
              options={[
                { value: 'none', label: t('pdf.none') },
                { value: 'small', label: t('pdf.small') },
                { value: 'large', label: t('pdf.large') },
              ]}
            />
          </div>
          {tooLarge && (
            <p class="notice" role="alert">
              {t('pdf.tooLarge', { size: formatBytes(totalBytes), max: formatBytes(limits.maxCombinedBytes) })}
            </p>
          )}
          <div class="tool__actions">
            {busy ? (
              <>
                <progress class="progress" max={Math.max(1, progress.total)} value={progress.done} aria-hidden="true" />
                <span class="tool__status">
                  {t('pdf.adding', { n: Math.min(progress.done + 1, progress.total), total: progress.total })}
                </span>
                <button type="button" class="btn btn--secondary" onClick={() => abort.current?.abort()}>
                  {t('batch.cancel')}
                </button>
              </>
            ) : (
              <>
                <button type="button" class="btn btn--primary" disabled={!valid.length || tooLarge} onClick={() => void build()}>
                  {t('pdf.create', { count: valid.length })}
                </button>
                <button type="button" class="btn btn--ghost" onClick={reset}>
                  {t('batch.startOver')}
                </button>
              </>
            )}
          </div>
        </>
      )}
      <div class="visually-hidden" role="status" aria-live="polite">
        {pdf ? t('pdf.ready', { count: pdf.pages }) : busy ? t('pdf.adding', { n: progress.done + 1, total: progress.total }) : ''}
      </div>
      {pdf && (
        <div class="result result--done result--pdf">
          <div class="result__thumb" aria-hidden="true">
            <span class="result__placeholder">PDF</span>
          </div>
          <div class="result__body">
            <p class="result__name">{pdf.name}</p>
            <p class="result__meta">
              <span>
                {t('pdf.pages', { count: pdf.pages })}
              </span>
              <span>{formatBytes(pdf.blob.size)}</span>
            </p>
          </div>
          <div class="result__actions">
            <button type="button" class="btn btn--primary" onClick={() => downloadBlob(pdf.blob, pdf.name)}>
              {t('pdf.download')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withI18n(ImageToPdfTool);
