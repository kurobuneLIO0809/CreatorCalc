import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { NumberField, Segmented } from '../components/tool-ui/fields';
import { formatBytes, kbToSafeBytes } from '../lib/bytes';
import { ImageEngine } from '../services/engine';
import { keepOriginal, RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS, toItemResult } from './shared';

const PRESETS = [20, 50, 100, 200, 500, 1000];

export default function TargetSizeTool() {
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
            Size limit
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
          label="Or type your own limit"
          value={targetKb}
          min={5}
          max={50000}
          step={1}
          suffix="KB"
          onChange={setTargetKb}
          hint={
            budget
              ? `Files will be at most ${budget.toLocaleString()} bytes, so they pass whether the website counts 1 KB as 1,000 or 1,024 bytes.`
              : 'Enter a size of at least 5 KB.'
          }
        />
        <Segmented<'jpeg' | 'webp'>
          label="Output format"
          value={format}
          onChange={setFormat}
          options={[
            { value: 'jpeg', label: 'JPG (accepted everywhere)' },
            { value: 'webp', label: 'WebP (smaller)' },
          ]}
          hint="Most application and government forms require JPG."
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
      actionLabel="Compress"
      zipName="resized-to-limit.zip"
      compare
      showSavings
      process={async (item, signal) => {
        if (!budget || budget < 5000) throw new Error('Enter a size limit of at least 5 KB first.');
        const info = item.info!;
        if (info.format === format && item.file.size <= budget) {
          return keepOriginal(item.file, info.format, `Already under ${formatBytes(budget)} — the original was kept unchanged.`, { success: true });
        }
        engine.current ??= new ImageEngine();
        const result = await engine.current.process(item.file, info, { output: { format, quality: 0.92 }, targetBytes: budget }, signal);
        const r = toItemResult(item.file, result, `${targetKb}kb`);
        r.success = !!result.fitsTarget;
        r.details = [
          result.fitsTarget
            ? `Exact size: ${result.blob.size.toLocaleString()} bytes (limit ${budget.toLocaleString()})${result.quality ? ` · quality ${Math.round(result.quality * 100)}%` : ''}`
            : `Could not get under the limit even at the smallest size. Try a larger limit or crop the image first.`,
        ];
        return r;
      }}
    />
  );
}
