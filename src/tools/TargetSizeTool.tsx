import { num, t, withI18n } from '../i18n/runtime';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { NumberField, Segmented } from '../components/tool-ui/fields';
import { formatBytes, kbToSafeBytes } from '../lib/bytes';
import { ImageEngine } from '../services/engine';
import { keepOriginal, RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS, toItemResult } from './shared';

const PRESETS = [20, 50, 100, 200, 500, 1000];

function TargetSizeTool() {
  const [targetKb, setTargetKb] = useState<number | ''>(100);
  const [format, setFormat] = useState<'jpeg' | 'webp'>('jpeg');
  const engine = useRef<ImageEngine | null>(null);
  useEffect(() => () => engine.current?.terminate(), []);

  const budget = typeof targetKb === 'number' ? kbToSafeBytes(targetKb) : null;
  const optionsKey = JSON.stringify({ targetKb, format });

  const options = useMemo(
    () => (
      <>
        <div class="field">
          <span class="field__label" id="preset-label">
            {t('target.limit')}
          </span>
          <div class="chips" role="group" aria-labelledby="preset-label">
            {PRESETS.map((kb) => (
              <button type="button" key={kb} class={`chip${targetKb === kb ? ' is-selected' : ''}`} aria-pressed={targetKb === kb} onClick={() => setTargetKb(kb)}>
                {kb >= 1000 ? `${kb / 1000} MB` : `${kb} KB`}
              </button>
            ))}
          </div>
        </div>
        <NumberField
          label={t('target.custom')}
          value={targetKb}
          min={5}
          max={50000}
          step={1}
          suffix="KB"
          onChange={setTargetKb}
          hint={
            budget ? t('target.budget', { bytes: num(budget) }) : t('target.min')
          }
        />
        <Segmented<'jpeg' | 'webp'>
          label={t('opt.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'jpeg', label: t('target.jpg') },
            { value: 'webp', label: t('target.webp') },
          ]}
          hint={t('target.formsHint')}
        />
      </>
    ),
    [targetKb, format, budget],
  );

  return (
    <BatchTool
      accept={RASTER_INPUTS}
      acceptAttr={RASTER_ACCEPT_ATTR}
      formatsHint={RASTER_HINT}
      options={options}
      optionsKey={optionsKey}
      actionKey="compress"
      zipName="resized-to-limit.zip"
      compare
      showSavings
      process={async (item, signal) => {
        if (!budget || budget < 5000) throw new Error(t('target.enterMin'));
        const info = item.info!;
        if (info.format === format && item.file.size <= budget) {
          return keepOriginal(item.file, info.format, t('target.already', { size: formatBytes(budget) }), { success: true });
        }
        engine.current ??= new ImageEngine();
        const result = await engine.current.process(item.file, info, { output: { format, quality: 0.92 }, targetBytes: budget }, signal);
        const r = toItemResult(item.file, result, `${targetKb}kb`);
        r.success = !!result.fitsTarget;
        r.details = [
          result.fitsTarget
            ? t('target.exact', { bytes: num(result.blob.size), limit: num(budget) }) + (result.quality ? t('target.quality', { q: Math.round(result.quality * 100) }) : '')
            : t('target.missed'),
        ];
        return r;
      }}
    />
  );
}

export default withI18n(TargetSizeTool);
