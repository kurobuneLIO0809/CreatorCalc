import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Dropzone } from '../components/tool-ui/Dropzone';
import { NumberField, Segmented } from '../components/tool-ui/fields';
import { formatBytes } from '../lib/bytes';
import type { OutputFormat } from '../lib/format';
import { outputName } from '../lib/filename';
import { centeredAspectRect, clampRect, dragRect, type Handle, type Rect, type Size } from '../lib/resize';
import { canCopyImage, copyImageToClipboard, downloadBlob } from '../services/download';
import { decodeHeic, defaultOutputFor, ImageEngine, InputError, inspectFile, isAbort, type InputInfo } from '../services/engine';
import { FORMAT_INFO } from '../lib/format';
import { RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS } from './shared';

const ASPECTS: Array<{ value: string; label: string; ratio?: number }> = [
  { value: 'free', label: 'Free' },
  { value: 'original', label: 'Original' },
  { value: '1:1', label: '1:1', ratio: 1 },
  { value: '4:3', label: '4:3', ratio: 4 / 3 },
  { value: '3:2', label: '3:2', ratio: 3 / 2 },
  { value: '16:9', label: '16:9', ratio: 16 / 9 },
  { value: '9:16', label: '9:16', ratio: 9 / 16 },
  { value: '4:5', label: '4:5', ratio: 4 / 5 },
];

const CORNERS: Handle[] = ['nw', 'ne', 'sw', 'se'];
const EDGES: Handle[] = ['n', 's', 'e', 'w'];

interface Loaded {
  file: File;
  info: InputInfo;
  url: string;
  natural: Size | null;
}

export default function CropperTool() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [aspect, setAspect] = useState('free');
  const [format, setFormat] = useState<'same' | OutputFormat>('same');
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string; width: number; height: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: Handle; x: number; y: number; start: Rect } | null>(null);
  const engine = useRef<ImageEngine | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      engine.current?.terminate();
      abort.current?.abort();
    },
    [],
  );
  useEffect(() => () => void (loaded && URL.revokeObjectURL(loaded.url)), [loaded]);
  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  const natural = loaded?.natural ?? null;
  const ratioFor = (value: string): number | undefined =>
    value === 'original' && natural ? natural.width / natural.height : ASPECTS.find((a) => a.value === value)?.ratio;
  const ratio = ratioFor(aspect);

  const onFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const info = await inspectFile(file, RASTER_INPUTS);
      let url: string;
      let nat: Size | null = null;
      if (info.format === 'heic') {
        // Browsers other than Safari cannot display HEIC: decode once and show a JPEG preview.
        const bitmap = await decodeHeic(file);
        nat = { width: bitmap.width, height: bitmap.height };
        const s = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * s);
        canvas.height = Math.round(bitmap.height * s);
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.9));
        canvas.width = 0;
        if (!blob) throw new Error('Could not create a preview of this image.');
        url = URL.createObjectURL(blob);
      } else {
        url = URL.createObjectURL(file);
      }
      setRect(null);
      setLoaded({ file, info, url, natural: nat });
    } catch (e) {
      setError(e instanceof InputError || e instanceof Error ? e.message : 'This image could not be opened.');
    } finally {
      setBusy(false);
    }
  }, []);

  const onImageLoad = () => {
    const img = imgRef.current;
    if (!img || !loaded) return;
    const nat = loaded.natural ?? { width: img.naturalWidth, height: img.naturalHeight };
    if (!loaded.natural) setLoaded({ ...loaded, natural: nat });
    const r = ratioFor(aspect);
    setRect(r ? centeredAspectRect(nat, r) : { x: 0, y: 0, ...nat });
    setScale(img.clientWidth / nat.width);
  };

  // Keep the display scale in sync with the rendered image size.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !natural || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setScale(img.clientWidth / natural.width));
    ro.observe(img);
    return () => ro.disconnect();
  }, [natural?.width, loaded?.url]);

  // Position the crop box via the CSSOM (CSP-safe).
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || !rect) return;
    box.style.setProperty('left', `${rect.x * scale}px`);
    box.style.setProperty('top', `${rect.y * scale}px`);
    box.style.setProperty('width', `${rect.width * scale}px`);
    box.style.setProperty('height', `${rect.height * scale}px`);
  }, [rect, scale]);

  const chooseAspect = (value: string) => {
    setAspect(value);
    const r = ratioFor(value);
    if (natural && r) setRect(centeredAspectRect(natural, r));
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!rect) return;
    const mode = ((e.target as HTMLElement).dataset.handle as Handle | undefined) ?? 'move';
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, x: e.clientX, y: e.clientY, start: rect };
    e.preventDefault();
  };
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || !natural || !scale) return;
    const next = dragRect(d.mode, d.start, (e.clientX - d.x) / scale, (e.clientY - d.y) / scale, natural, ratio);
    setRect(next);
  };
  const onPointerUp = () => {
    drag.current = null;
    if (rect && natural) setRect(clampRect(rect, natural));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!rect || !natural) return;
    const step = Math.max(1, Math.round(Math.max(natural.width, natural.height) / 100));
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    if (e.shiftKey) setRect(clampRect(dragRect('se', rect, d[0] || (ratio ? d[1] * ratio : 0), d[1], natural, ratio), natural));
    else setRect(clampRect(dragRect('move', rect, d[0], d[1], natural), natural));
  };

  const setField = (key: keyof Rect, value: number | '') => {
    if (!rect || !natural || value === '') return;
    const next = { ...rect, [key]: value };
    if (ratio && key === 'width') next.height = value / ratio;
    if (ratio && key === 'height') next.width = value * ratio;
    setRect(clampRect(next, natural));
  };

  const crop = async () => {
    if (!loaded || !rect) return;
    setBusy(true);
    setError(null);
    abort.current = new AbortController();
    try {
      engine.current ??= new ImageEngine();
      const out = format === 'same' ? defaultOutputFor(loaded.info.format) : format;
      const r = await engine.current.process(loaded.file, loaded.info, { crop: clampRect(rect, natural!), output: { format: out, quality: 0.92 } }, abort.current.signal);
      setResult({ blob: r.blob, url: URL.createObjectURL(r.blob), name: outputName(loaded.file.name, FORMAT_INFO[r.format].ext, 'cropped'), width: r.width, height: r.height });
    } catch (e) {
      if (!isAbort(e)) setError(e instanceof Error ? e.message : 'Cropping failed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    abort.current?.abort();
    setLoaded(null);
    setRect(null);
    setResult(null);
    setError(null);
  };

  return (
    <div class="tool">
      <Dropzone acceptAttr={RASTER_ACCEPT_ATTR} multiple={false} compact={!!loaded} hint={`${RASTER_HINT} · one image at a time`} onFiles={onFiles} />
      {error && (
        <p class="notice notice--error" role="alert">
          {error}
        </p>
      )}
      {busy && !loaded && <p class="muted">Opening image…</p>}
      {loaded && (
        <>
          <div class="crop-stage">
            <div class="crop-stage__inner" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
              <img ref={imgRef} src={loaded.url} alt="Image to crop" class="crop-stage__img" onLoad={onImageLoad} draggable={false} onError={() => setError('This image cannot be displayed in your browser.')} />
              {rect && (
                <div
                  ref={boxRef}
                  class="crop-box"
                  tabIndex={0}
                  role="group"
                  aria-label={`Crop area ${Math.round(rect.width)} by ${Math.round(rect.height)} pixels. Arrow keys move it, Shift + arrow keys resize it.`}
                  onPointerDown={onPointerDown}
                  onKeyDown={onKeyDown}
                >
                  <span class="crop-box__grid" aria-hidden="true" />
                  {(ratio ? CORNERS : [...CORNERS, ...EDGES]).map((h) => (
                    <span key={h} class={`crop-handle crop-handle--${h}`} data-handle={h} aria-hidden="true" />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div class="tool__options">
            <Segmented label="Aspect ratio" value={aspect} onChange={chooseAspect} options={ASPECTS.map((a) => ({ value: a.value, label: a.label }))} />
            {rect && (
              <div class="field-grid">
                <NumberField label="X" value={Math.round(rect.x)} min={0} suffix="px" onChange={(v) => setField('x', v)} />
                <NumberField label="Y" value={Math.round(rect.y)} min={0} suffix="px" onChange={(v) => setField('y', v)} />
                <NumberField label="Width" value={Math.round(rect.width)} min={1} suffix="px" onChange={(v) => setField('width', v)} />
                <NumberField label="Height" value={Math.round(rect.height)} min={1} suffix="px" onChange={(v) => setField('height', v)} />
              </div>
            )}
            <Segmented<'same' | OutputFormat>
              label="Save as"
              value={format}
              onChange={setFormat}
              options={[
                { value: 'same', label: 'Same as original' },
                { value: 'jpeg', label: 'JPG' },
                { value: 'png', label: 'PNG' },
                { value: 'webp', label: 'WebP' },
              ]}
            />
          </div>
          <div class="tool__actions">
            <button type="button" class="btn btn--primary" disabled={!rect || busy} onClick={() => void crop()}>
              {busy ? 'Cropping…' : 'Crop image'}
            </button>
            {busy && (
              <button type="button" class="btn btn--secondary" onClick={() => abort.current?.abort()}>
                Cancel
              </button>
            )}
            <button type="button" class="btn btn--ghost" onClick={reset}>
              Start over
            </button>
          </div>
        </>
      )}
      <div class="visually-hidden" role="status" aria-live="polite">
        {result ? `Cropped image ready: ${result.width} by ${result.height} pixels.` : ''}
      </div>
      {result && (
        <div class="crop-result">
          <img src={result.url} alt="Cropped result" />
          <div>
            <p class="result__name">{result.name}</p>
            <p class="result__meta">
              <span>
                {result.width} × {result.height} px
              </span>
              <span>{formatBytes(result.blob.size)}</span>
            </p>
            <div class="button-row">
              <button type="button" class="btn btn--primary" onClick={() => downloadBlob(result.blob, result.name)}>
                Download
              </button>
              {canCopyImage() && (
                <button
                  type="button"
                  class="btn btn--secondary"
                  onClick={async () => {
                    try {
                      await copyImageToClipboard(result.blob);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      setError('Copying images is not allowed in this browser. Use Download instead.');
                    }
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
