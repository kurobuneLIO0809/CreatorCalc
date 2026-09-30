import { t, withI18n } from '../i18n/runtime';
import { useMemo, useRef, useState } from 'preact/hooks';
import { useEffect } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { Segmented, Select, Slider } from '../components/tool-ui/fields';
import type { DetectedFormat, OutputFormat } from '../lib/format';
import { ImageEngine } from '../services/engine';
import { animationNote, keepOriginal, toItemResult } from './shared';

type FormatChoice = 'same' | OutputFormat;
const ACCEPT: DetectedFormat[] = ['jpeg', 'png', 'webp', 'bmp'];

function sameAs(format: DetectedFormat): OutputFormat {
  return format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpeg';
}

function CompressorTool() {
  const [format, setFormat] = useState<FormatChoice>('same');
  const [quality, setQuality] = useState(75);
  const [colors, setColors] = useState('256');
  const [maxSide, setMaxSide] = useState('none');
  const engine = useRef<ImageEngine | null>(null);
  useEffect(() => () => engine.current?.terminate(), []);

  const optionsKey = JSON.stringify({ format, quality, colors, maxSide });
  const pngSelected = format === 'png';

  const options = useMemo(
    () => (
      <>
        <Segmented<FormatChoice>
          label={t('opt.outputFormat')}
          value={format}
          onChange={setFormat}
          options={[
            { value: 'same', label: t('opt.same') },
            { value: 'jpeg', label: 'JPG' },
            { value: 'webp', label: 'WebP' },
            { value: 'png', label: 'PNG' },
          ]}
          hint={t('compress.formatHint')}
        />
        <Slider
          label={t('compress.quality')}
          value={quality}
          min={10}
          max={95}
          suffix="%"
          onChange={setQuality}
          hint={t('compress.qualityHint')}
        />
        <Select
          label={t('compress.pngColors')}
          value={colors}
          onChange={setColors}
          options={[
            { value: '256', label: t('compress.colors256') },
            { value: '128', label: t('compress.colorsN', { n: 128 }) },
            { value: '64', label: t('compress.colorsN', { n: 64 }) },
            { value: '32', label: t('compress.colors32') },
            { value: '0', label: t('compress.lossless') },
          ]}
          hint={pngSelected || format === 'same' ? t('compress.pngHint') : t('compress.pngHintOther')}
        />
        <Select
          label={t('compress.maxSide')}
          value={maxSide}
          onChange={setMaxSide}
          options={[
            { value: 'none', label: t('compress.noResize') },
            { value: '3840', label: '3840 px (4K)' },
            { value: '2560', label: '2560 px' },
            { value: '1920', label: '1920 px (Full HD)' },
            { value: '1280', label: '1280 px' },
            { value: '1024', label: '1024 px' },
            { value: '800', label: '800 px' },
          ]}
          hint={t('compress.maxSideHint')}
        />
      </>
    ),
    [format, quality, colors, maxSide, pngSelected],
  );

  return (
    <BatchTool
      accept={ACCEPT}
      acceptAttr="image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp"
      formatsHint="JPG, PNG, WebP, BMP"
      options={options}
      optionsKey={optionsKey}
      actionKey="compress"
      zipName="compressed-images.zip"
      compare
      showSavings
      wrongFormatMessage={(f) =>
        f === 'heic' ? t('compress.heic') : f === 'gif' ? t('compress.gif') : undefined
      }
      process={async (item, signal) => {
        engine.current ??= new ImageEngine();
        const info = item.info!;
        const out = format === 'same' ? sameAs(info.format) : format;
        const longest = maxSide === 'none' ? 0 : Number(maxSide);
        const result = await engine.current.process(
          item.file,
          info,
          {
            output: { format: out, quality: quality / 100, pngColors: Number(colors) },
            resize: longest ? { mode: 'longest', longest } : { mode: 'none' },
            allowUpscale: false,
          },
          signal,
        );
        const resized = result.width !== info.width || result.height !== info.height;
        if (out === info.format && !resized && result.blob.size >= item.file.size) {
          return keepOriginal(item.file, info.format, t('compress.kept'));
        }
        const r = toItemResult(item.file, result, 'compressed');
        r.notes = [...animationNote(info.format, info.animated), ...r.notes];
        return r;
      }}
    />
  );
}

export default withI18n(CompressorTool);
