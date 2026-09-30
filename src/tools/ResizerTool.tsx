import { t, withI18n } from '../i18n/runtime';
import { features } from '../config/site';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { Checkbox, NumberField, Segmented, Select, Slider } from '../components/tool-ui/fields';
import type { OutputFormat } from '../lib/format';
import { computeResize, type ResizeSpec } from '../lib/resize';
import { defaultOutputFor, ImageEngine } from '../services/engine';
import { animationNote, RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS, toItemResult } from './shared';
import type { BatchItem } from '../components/tool-ui/useBatch';

type Mode = 'pixels' | 'percent';
type FormatChoice = 'same' | OutputFormat;
const MAX_DIM = 20000;

const PRESETS: Array<{ value: string; note?: string; w?: number; h?: number }> = [
  { value: 'custom' },
  { value: '3840x2160', note: '4K', w: 3840, h: 2160 },
  { value: '1920x1080', note: 'Full HD', w: 1920, h: 1080 },
  { value: '1280x720', note: 'HD', w: 1280, h: 720 },
  { value: '1080x1080', note: 'resize.square', w: 1080, h: 1080 },
  { value: '1080x1350', note: 'resize.portrait', w: 1080, h: 1350 },
  { value: '1080x1920', note: 'resize.story', w: 1080, h: 1920 },
  { value: '800x600', w: 800, h: 600 },
];

const presetLabel = (p: (typeof PRESETS)[number]) =>
  !p.w ? t('resize.custom') : `${p.w} × ${p.h}${p.note ? ` (${p.note.startsWith('resize.') ? t(p.note) : p.note})` : ''}`;

function ResizerTool() {
  const [mode, setMode] = useState<Mode>('pixels');
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [percent, setPercent] = useState(50);
  const [noUpscale, setNoUpscale] = useState(true);
  const [format, setFormat] = useState<FormatChoice>('same');
  const [quality, setQuality] = useState(90);
  const [preset, setPreset] = useState('custom');
  const [first, setFirst] = useState<{ width: number; height: number } | null>(null);
  const engine = useRef<ImageEngine | null>(null);
  useEffect(() => () => engine.current?.terminate(), []);

  const onItemsChange = useCallback((items: BatchItem[]) => {
    const f = items.find((it) => it.info?.width && it.info?.height);
    setFirst(f ? { width: f.info!.width!, height: f.info!.height! } : null);
  }, []);

  const spec = (): ResizeSpec | null => {
    if (mode === 'percent') return { mode: 'percent', percent };
    const w = typeof width === 'number' && width > 0 ? Math.min(MAX_DIM, Math.round(width)) : undefined;
    const h = typeof height === 'number' && height > 0 ? Math.min(MAX_DIM, Math.round(height)) : undefined;
    if (!w && !h) return null;
    return { mode: 'dimensions', width: w, height: h, keepAspect };
  };
  const current = spec();
  const optionsKey = JSON.stringify({ mode, width, height, keepAspect, percent, noUpscale, format, quality });

  const preview = first && current ? computeResize(first, current, !noUpscale) : null;

  const options = useMemo(
    () => (
      <>
        <Segmented<Mode>
          label={t('resize.by')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'pixels', label: t('resize.pixels') },
            { value: 'percent', label: t('resize.percent') },
          ]}
        />
        {mode === 'pixels' ? (
          <>
            <Select
              label={t('resize.preset')}
              value={preset}
              onChange={(v) => {
                setPreset(v);
                const p = PRESETS.find((x) => x.value === v);
                if (p?.w && p?.h) {
                  setWidth(p.w);
                  setHeight(p.h);
                }
              }}
              options={PRESETS.map((p) => ({ value: p.value, label: presetLabel(p) }))}
              hint={keepAspect ? t('resize.fitHint') : undefined}
            />
            <div class="field-pair">
              <NumberField label={t('resize.width')} value={width} min={1} max={MAX_DIM} suffix="px" placeholder={first && !height ? String(first.width) : t('resize.auto')} onChange={(v) => { setWidth(v); setPreset('custom'); }} />
              <NumberField label={t('resize.height')} value={height} min={1} max={MAX_DIM} suffix="px" placeholder={first && !width ? String(first.height) : t('resize.auto')} onChange={(v) => { setHeight(v); setPreset('custom'); }} />
            </div>
            <Checkbox label={t('resize.keepAspect')} checked={keepAspect} onChange={setKeepAspect} hint={keepAspect ? t('resize.keepHint') : t('resize.stretchHint')} />
          </>
        ) : (
          <Slider label={t('resize.scale')} value={percent} min={1} max={400} suffix="%" onChange={setPercent} />
        )}
        <Checkbox label={t('resize.noUpscale')} checked={noUpscale} onChange={setNoUpscale} />
        <Segmented<FormatChoice>
          label={t('opt.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'same', label: t('opt.same') },
            { value: 'jpeg', label: 'JPG' },
            { value: 'png', label: 'PNG' },
            { value: 'webp', label: 'WebP' },
          ]}
          hint={features.heicDecoder ? t('resize.formatHintHeic') : t('resize.formatHint')}
        />
        {format !== 'png' && <Slider label={t('compress.quality')} value={quality} min={40} max={100} suffix="%" onChange={setQuality} />}
        {preview && first && (
          <p class="tool__preview-size">
            {t('resize.firstImage')} {first.width} × {first.height} px → <strong>{preview.width} × {preview.height} px</strong>
          </p>
        )}
      </>
    ),
    [mode, width, height, keepAspect, percent, noUpscale, format, quality, preset, preview?.width, preview?.height, first],
  );

  return (
    <BatchTool
      accept={RASTER_INPUTS}
      acceptAttr={RASTER_ACCEPT_ATTR}
      formatsHint={RASTER_HINT}
      options={options}
      optionsKey={optionsKey}
      autoRun={false}
      actionKey="resize"
      zipName="resized-images.zip"
      onItemsChange={onItemsChange}
      process={async (item, signal) => {
        const s = spec();
        if (!s) throw new Error(t('resize.needDims'));
        engine.current ??= new ImageEngine();
        const info = item.info!;
        const out = format === 'same' ? defaultOutputFor(info.format) : format;
        const result = await engine.current.process(item.file, info, { output: { format: out, quality: quality / 100 }, resize: s, allowUpscale: !noUpscale }, signal);
        const r = toItemResult(item.file, result, `${result.width}x${result.height}`);
        r.notes = [...animationNote(info.format, info.animated), ...r.notes];
        return r;
      }}
    />
  );
}

export default withI18n(ResizerTool);
