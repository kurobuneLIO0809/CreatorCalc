import { t, withI18n } from '../i18n/runtime';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import type { BatchItem } from '../components/tool-ui/useBatch';
import { normalizeRotation, type Rotation } from '../lib/resize';
import { defaultOutputFor, ImageEngine } from '../services/engine';
import { animationNote, RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS, toItemResult } from './shared';

function RotateTool() {
  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const engine = useRef<ImageEngine | null>(null);
  useEffect(() => () => engine.current?.terminate(), []);

  const onItemsChange = useCallback((items: BatchItem[]) => setPreviewFile(items[0]?.file ?? null), []);

  useEffect(() => {
    setPreviewFailed(false);
    if (!previewFile) return setPreviewUrl(null);
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  useEffect(() => {
    // Live preview via the CSSOM (CSP-safe), mirroring the exact pipeline transform order.
    const sx = flipH ? -1 : 1;
    const sy = flipV ? -1 : 1;
    imgRef.current?.style.setProperty('transform', `scale(${sx}, ${sy}) rotate(${rotation}deg)`);
  }, [rotation, flipH, flipV, previewUrl]);

  const unchanged = rotation === 0 && !flipH && !flipV;
  const optionsKey = JSON.stringify({ rotation, flipH, flipV });

  const options = (
    <div class="field">
      <span class="field__label" id="rotate-label">
        {t('rot.label')}
      </span>
      <div class="button-row" role="group" aria-labelledby="rotate-label">
        <button type="button" class="btn btn--secondary" onClick={() => setRotation(normalizeRotation(rotation - 90))}>
          {t('rot.left')}
        </button>
        <button type="button" class="btn btn--secondary" onClick={() => setRotation(normalizeRotation(rotation + 90))}>
          {t('rot.right')}
        </button>
        <button type="button" class="btn btn--secondary" onClick={() => setRotation(normalizeRotation(rotation + 180))}>
          {t('rot.180')}
        </button>
        <button type="button" class="btn btn--secondary" aria-pressed={flipH} onClick={() => setFlipH(!flipH)}>
          {t('rot.flipH')}
        </button>
        <button type="button" class="btn btn--secondary" aria-pressed={flipV} onClick={() => setFlipV(!flipV)}>
          {t('rot.flipV')}
        </button>
        <button type="button" class="btn btn--ghost" disabled={unchanged} onClick={() => { setRotation(0); setFlipH(false); setFlipV(false); }}>
          {t('rot.reset')}
        </button>
      </div>
      <p class="field__hint" aria-live="polite">
        {t('rot.current', { deg: rotation })}
        {flipH ? t('rot.mirrored') : ''}
        {flipV ? t('rot.flipped') : ''}
        {t('rot.applied')}
      </p>
    </div>
  );

  return (
    <BatchTool
      accept={RASTER_INPUTS}
      acceptAttr={RASTER_ACCEPT_ATTR}
      formatsHint={RASTER_HINT}
      options={options}
      optionsKey={optionsKey}
      autoRun={false}
      actionKey="rotate"
      zipName="rotated-images.zip"
      onItemsChange={onItemsChange}
      preview={() =>
        previewUrl && (
          <div class="rotate-preview">
            {previewFailed ? (
              <p class="muted">{t('rot.noPreview')}</p>
            ) : (
              <img ref={imgRef} src={previewUrl} alt={t('rot.previewAlt')} onError={() => setPreviewFailed(true)} />
            )}
          </div>
        )
      }
      process={async (item, signal) => {
        if (unchanged) throw new Error(t('rot.choose'));
        engine.current ??= new ImageEngine();
        const info = item.info!;
        const out = defaultOutputFor(info.format);
        const result = await engine.current.process(item.file, info, { rotate: rotation, flipH, flipV, output: { format: out, quality: 0.92 } }, signal);
        const r = toItemResult(item.file, result, 'rotated');
        r.notes = [...animationNote(info.format, info.animated), ...r.notes];
        return r;
      }}
    />
  );
}

export default withI18n(RotateTool);
