import type { ComponentChildren } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { limits } from '../../config/site';
import { formatBytes, percentChange } from '../../lib/bytes';
import { t } from '../../i18n/runtime';
import type { DetectedFormat } from '../../lib/format';
import { buildZip } from '../../lib/zip';
import { canCopyImage, copyImageToClipboard, downloadBlob } from '../../services/download';
import { CompareSlider } from './CompareSlider';
import { Dropzone } from './Dropzone';
import { useBatch, type BatchItem, type Processor } from './useBatch';

export interface BatchToolProps {
  accept: readonly DetectedFormat[];
  acceptAttr: string;
  formatsHint: string;
  /** Options UI rendered above the results. */
  options?: ComponentChildren;
  /** Serialized options; a change marks results as stale. */
  optionsKey: string;
  process: Processor;
  /** Process files as soon as they are added (default true). */
  autoRun?: boolean;
  /** Verb for the main button: action.<key>_one / _other in the UI dictionary. */
  actionKey: 'compress' | 'convert' | 'resize' | 'rotate' | 'clean';
  zipName: string;
  wrongFormatMessage?: (format: DetectedFormat) => string | undefined;
  /** Show a before/after comparison for results. */
  compare?: boolean;
  /** Show size change badges (useful for compression). */
  showSavings?: boolean;
  /** Rendered once files are added, above the options (e.g. a live preview). */
  preview?: (items: BatchItem[]) => ComponentChildren;
  /** Called with the valid (accepted) items whenever the list changes. */
  onItemsChange?: (items: BatchItem[]) => void;
}

const LIVE_RERUN_LIMIT = 3;

/** Localised "42% smaller" / "10% larger". */
export function describeChange(before: number, after: number): string {
  const pct = percentChange(before, after);
  if (pct < 0) return t('change.smaller', { pct: Math.abs(pct) });
  if (pct > 0) return t('change.larger', { pct });
  return t('change.same');
}

export function BatchTool(props: BatchToolProps) {
  const { accept, acceptAttr, formatsHint, options, optionsKey, autoRun = true, actionKey, zipName, compare, showSavings } = props;
  const batch = useBatch(accept, props.wrongFormatMessage);
  const { items, running, progress, notice } = batch;
  const processRef = useRef(props.process);
  processRef.current = props.process;
  const processor = useCallback<Processor>((item, signal) => processRef.current(item, signal), []);
  const [ranKey, setRanKey] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const valid = items.filter((it) => !it.invalid);
  const onItemsChange = props.onItemsChange;
  useEffect(() => onItemsChange?.(items.filter((it) => !it.invalid)), [items, onItemsChange]);
  const done = items.filter((it) => it.status === 'done' && it.result);
  const stale = ranKey !== null && ranKey !== optionsKey && valid.length > 0;

  const start = useCallback(
    async (only?: BatchItem[]) => {
      setRanKey(optionsKey);
      await batch.run(processor, only);
    },
    [batch.run, processor, optionsKey],
  );

  const onFiles = useCallback(
    async (files: File[]) => {
      const added = await batch.addFiles(files);
      if (autoRun && added.length) {
        // Only process the new files; earlier results stay.
        if (ranKey === null || ranKey === optionsKey) await start(added);
        else await start();
      }
    },
    [batch.addFiles, autoRun, start, ranKey, optionsKey],
  );

  // Live preview: re-run small batches automatically when settings change.
  useEffect(() => {
    if (!stale || !autoRun || valid.length > LIVE_RERUN_LIMIT) return;
    const t = setTimeout(() => void start(), 350);
    return () => clearTimeout(t);
  }, [stale, optionsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) setStatus(t('batch.processing', { n: Math.min(progress.done + 1, progress.total), total: progress.total }));
    else if (done.length) setStatus(t('batch.ready', { count: done.length }));
    else setStatus('');
  }, [running, progress.done, progress.total, done.length]);

  const totals = useMemo(() => {
    const before = done.reduce((n, it) => n + it.file.size, 0);
    const after = done.reduce((n, it) => n + (it.result?.blob.size ?? 0), 0);
    return { before, after };
  }, [done]);

  const zipTooLarge = totals.after > limits.maxCombinedBytes;

  const downloadAll = async () => {
    if (zipTooLarge) {
      batch.setNotice(t('batch.zipTooLarge', { size: formatBytes(totals.after) }));
      return;
    }
    const entries = await Promise.all(done.map(async (it) => ({ name: it.result!.name, data: new Uint8Array(await it.result!.blob.arrayBuffer()) })));
    const zip = buildZip(entries);
    downloadBlob(new Blob([zip as BlobPart], { type: 'application/zip' }), zipName);
  };

  const copy = async (item: BatchItem) => {
    try {
      await copyImageToClipboard(item.result!.blob);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      batch.setNotice(t('batch.copyBlocked'));
    }
  };

  const compareItem = compare ? done.find((it) => it.id === compareId) : undefined;
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!compareItem) return setOriginalUrl(null);
    const url = URL.createObjectURL(compareItem.file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [compareItem?.id, compareItem?.file]);

  const hasItems = items.length > 0;

  return (
    <div class="tool">
      <Dropzone
        acceptAttr={acceptAttr}
        multiple
        compact={hasItems}
        disabled={items.length >= limits.maxBatchFiles}
        hint={t('dz.hintBatch', { formats: formatsHint, max: limits.maxBatchFiles, mb: Math.round(limits.maxFileBytes / 1048576) })}
        onFiles={onFiles}
      />

      {hasItems && props.preview?.(valid)}

      <div class={`tool__layout${hasItems ? ' has-items' : ''}${autoRun ? '' : ' options-first'}`}>
        {options && (
          <div class="tool__options" role="group" aria-label={t('batch.settings')}>
            {options}
          </div>
        )}

        <div class="tool__main">
          <div class="visually-hidden" role="status" aria-live="polite">
            {status}
          </div>

          {notice && (
            <p class="notice" role="alert">
              {notice}
            </p>
          )}

          {hasItems && (
            <div class="tool__actions">
              {running ? (
                <>
                  <progress class="progress" max={Math.max(1, progress.total)} value={progress.done} aria-hidden="true" />
                  <span class="tool__status">{status}</span>
                  <button type="button" class="btn btn--secondary" onClick={batch.cancel}>
                    {t('batch.cancel')}
                  </button>
                </>
              ) : (
                <>
                  {(!autoRun || stale || valid.some((it) => it.status === 'pending' || it.status === 'error')) && valid.length > 0 && (
                    <button type="button" class="btn btn--primary" onClick={() => void start()}>
                      {autoRun && (stale || ranKey !== null)
                        ? valid.length === 1
                          ? t('batch.applyOne')
                          : t('batch.applyAll', { count: valid.length })
                        : t(`action.${actionKey}`, { count: valid.length })}
                    </button>
                  )}
                  {done.length > 1 && (
                    <button type="button" class="btn btn--primary" onClick={() => void downloadAll()}>
                      {t('batch.downloadAll')}
                    </button>
                  )}
                  <button
                    type="button"
                    class="btn btn--ghost"
                    onClick={() => {
                      batch.reset();
                      setRanKey(null);
                      setCompareId(null);
                    }}
                  >
                    {t('batch.startOver')}
                  </button>
                </>
              )}
            </div>
          )}

          {showSavings && done.length > 1 && !running && (
            <p class="tool__summary">
              {t('batch.total')} {formatBytes(totals.before)} → <strong>{formatBytes(totals.after)}</strong> ({describeChange(totals.before, totals.after)})
            </p>
          )}

          {hasItems && (
            <ul class="results" aria-label={t('batch.files')}>
              {items.map((item) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  showSavings={showSavings}
                  canCompare={!!compare}
                  comparing={compareId === item.id}
                  copied={copied === item.id}
                  canCopy={canCopyImage() && item.result?.blob.type.startsWith('image/') === true}
                  onCompare={() => setCompareId(compareId === item.id ? null : item.id)}
                  onCopy={() => void copy(item)}
                  onRemove={() => batch.remove(item.id)}
                  disabled={running}
                />
              ))}
            </ul>
          )}

          {compareItem && originalUrl && (
            <section class="tool__compare" aria-label={t('batch.compareRegion')}>
              <CompareSlider beforeUrl={originalUrl} afterUrl={compareItem.result!.url} beforeLabel={t('batch.original')} afterLabel={t('batch.result')} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  item: BatchItem;
  showSavings?: boolean;
  canCompare: boolean;
  comparing: boolean;
  copied: boolean;
  canCopy: boolean;
  disabled: boolean;
  onCompare: () => void;
  onCopy: () => void;
  onRemove: () => void;
}

function ResultRow({ item, showSavings, canCompare, comparing, copied, canCopy, disabled, onCompare, onCopy, onRemove }: RowProps) {
  const r = item.result;
  const pct = r ? percentChange(item.file.size, r.blob.size) : 0;
  const isImage = r?.blob.type.startsWith('image/');
  return (
    <li class={`result result--${item.status}`}>
      <div class="result__thumb" aria-hidden="true">
        {r && isImage ? <img src={r.url} alt="" loading="lazy" decoding="async" /> : <span class="result__placeholder">{item.status === 'processing' ? <span class="spinner" /> : null}</span>}
      </div>
      <div class="result__body">
        <p class="result__name" title={r?.name ?? item.file.name}>
          {r?.name ?? item.file.name}
        </p>
        <p class="result__meta">
          {item.status === 'pending' && <span>{t('row.waiting')}</span>}
          {item.status === 'processing' && <span>{t('row.processing')}</span>}
          {item.status === 'error' && <span class="result__error">{item.error}</span>}
          {item.status === 'done' && r && (
            <>
              <span>
                {formatBytes(item.file.size)} → <strong>{formatBytes(r.blob.size)}</strong>
              </span>
              {showSavings && !r.keptOriginal && (
                <span class={`badge ${pct <= 0 ? 'badge--good' : 'badge--warn'}`}>{describeChange(item.file.size, r.blob.size)}</span>
              )}
              {r.success === false && <span class="badge badge--warn">{t('row.targetMissed')}</span>}
              {r.success === true && <span class="badge badge--good">{t('row.targetMet')}</span>}
              {r.width && r.height && (
                <span>
                  {r.width} × {r.height} px
                </span>
              )}
            </>
          )}
        </p>
        {r?.details?.map((d) => (
          <p class="result__note" key={d}>
            {d}
          </p>
        ))}
        {r?.notes.map((n) => (
          <p class="result__note" key={n}>
            {n}
          </p>
        ))}
      </div>
      <div class="result__actions">
        {r && (
          <button type="button" class="btn btn--primary btn--sm" onClick={() => downloadBlob(r.blob, r.name)}>
            {t('row.download')}
          </button>
        )}
        {r && canCopy && (
          <button type="button" class="btn btn--secondary btn--sm" onClick={onCopy}>
            {copied ? t('row.copied') : t('row.copy')}
          </button>
        )}
        {r && canCompare && isImage && (
          <button type="button" class="btn btn--secondary btn--sm" aria-pressed={comparing} onClick={onCompare}>
            {comparing ? t('row.hideCompare') : t('row.compare')}
          </button>
        )}
        <button type="button" class="btn btn--icon btn--sm" onClick={onRemove} disabled={disabled} aria-label={t('row.remove', { name: item.file.name })}>
          ×
        </button>
      </div>
    </li>
  );
}
