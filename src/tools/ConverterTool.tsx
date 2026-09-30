import { t, withI18n } from '../i18n/runtime';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { Checkbox, ColorField, Segmented, Slider } from '../components/tool-ui/fields';
import { formatLabel, type DetectedFormat, type OutputFormat } from '../lib/format';
import { ImageEngine } from '../services/engine';
import { animationNote, OUTPUT_OPTIONS, RASTER_ACCEPT_ATTR, RASTER_HINT, RASTER_INPUTS, sameFormatMessage, toItemResult } from './shared';

export type ConverterId = 'image-converter' | 'heic-to-jpg' | 'webp-to-jpg' | 'png-to-jpg' | 'jpg-to-png' | 'image-to-webp';

interface ConverterConfig {
  accept: readonly DetectedFormat[];
  acceptAttr: string;
  /** Formats hint (a dictionary key or a plain format list). */
  hint: () => string;
  outputs: OutputFormat[];
  defaultOutput: OutputFormat;
  defaultQuality: number;
  zipName: string;
  showSavings?: boolean;
  wrongFormat?: (f: DetectedFormat) => string | undefined;
}

const toConverter = (f: DetectedFormat) => t('msg.useConverter', { format: formatLabel(f) });

const CONFIGS: Record<ConverterId, ConverterConfig> = {
  'image-converter': {
    accept: [...RASTER_INPUTS, 'tiff'],
    acceptAttr: `${RASTER_ACCEPT_ATTR},.tif,.tiff`,
    hint: () => t('conv.hintAll', { formats: RASTER_HINT }),
    outputs: ['jpeg', 'png', 'webp'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'converted-images.zip',
  },
  'heic-to-jpg': {
    accept: ['heic'],
    acceptAttr: '.heic,.heif,image/heic,image/heif',
    hint: () => t('conv.hintHeic'),
    outputs: ['jpeg', 'png'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'heic-to-jpg.zip',
    wrongFormat: (f) => (f === 'jpeg' ? sameFormatMessage(f) : t('msg.notHeic', { format: formatLabel(f) })),
  },
  'webp-to-jpg': {
    accept: ['webp'],
    acceptAttr: '.webp,image/webp',
    hint: () => t('conv.hintWebp'),
    outputs: ['jpeg', 'png'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'webp-to-jpg.zip',
    wrongFormat: (f) => (f === 'jpeg' ? sameFormatMessage(f) : toConverter(f)),
  },
  'png-to-jpg': {
    accept: ['png'],
    acceptAttr: '.png,image/png',
    hint: () => t('conv.hintPng'),
    outputs: ['jpeg'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'png-to-jpg.zip',
    showSavings: true,
    wrongFormat: (f) => (f === 'jpeg' ? sameFormatMessage(f) : toConverter(f)),
  },
  'jpg-to-png': {
    accept: ['jpeg'],
    acceptAttr: '.jpg,.jpeg,image/jpeg',
    hint: () => t('conv.hintJpg'),
    outputs: ['png'],
    defaultOutput: 'png',
    defaultQuality: 100,
    zipName: 'jpg-to-png.zip',
    wrongFormat: (f) => (f === 'png' ? sameFormatMessage(f) : toConverter(f)),
  },
  'image-to-webp': {
    accept: ['jpeg', 'png', 'bmp', 'gif'],
    acceptAttr: '.jpg,.jpeg,.png,.bmp,.gif,image/jpeg,image/png,image/bmp,image/gif',
    hint: () => 'JPG, PNG, BMP, GIF',
    outputs: ['webp'],
    defaultOutput: 'webp',
    defaultQuality: 80,
    zipName: 'webp-images.zip',
    showSavings: true,
    wrongFormat: (f) => (f === 'webp' ? sameFormatMessage(f) : toConverter(f)),
  },
};

function ConverterTool({ id }: { id: ConverterId }) {
  const cfg = CONFIGS[id];
  const [output, setOutput] = useState<OutputFormat>(cfg.defaultOutput);
  const [quality, setQuality] = useState(cfg.defaultQuality);
  const [background, setBackground] = useState('#ffffff');
  const [lossless, setLossless] = useState(false);
  const engine = useRef<ImageEngine | null>(null);
  useEffect(() => () => engine.current?.terminate(), []);

  const optionsKey = JSON.stringify({ output, quality, background, lossless });
  const lossy = output === 'jpeg' || (output === 'webp' && !lossless);

  const options = useMemo(
    () => (
      <>
        {cfg.outputs.length > 1 && (
          <Segmented<OutputFormat> label={t('conv.to')} value={output} onChange={setOutput} options={OUTPUT_OPTIONS.filter((o) => cfg.outputs.includes(o.value))} />
        )}
        {output === 'webp' && (
          <Checkbox
            label={t('conv.lossless')}
            checked={lossless}
            onChange={setLossless}
            hint={t('conv.losslessHint')}
          />
        )}
        {lossy && (
          <Slider
            label={t('conv.quality')}
            value={quality}
            min={30}
            max={100}
            suffix="%"
            onChange={setQuality}
            hint={output === 'jpeg' ? t('conv.qualityJpg') : t('conv.qualityWebp')}
          />
        )}
        {output === 'jpeg' && (
          <ColorField label={t('conv.bg')} value={background} onChange={setBackground} hint={t('conv.bgHint')} />
        )}
        {output === 'png' && id === 'jpg-to-png' && (
          <p class="field__hint">
            {t('conv.pngNote')}
          </p>
        )}
      </>
    ),
    [output, quality, background, lossless, lossy, id],
  );

  return (
    <BatchTool
      accept={cfg.accept}
      acceptAttr={cfg.acceptAttr}
      formatsHint={cfg.hint()}
      options={options}
      optionsKey={optionsKey}
      actionKey="convert"
      zipName={cfg.zipName}
      showSavings={cfg.showSavings}
      wrongFormatMessage={cfg.wrongFormat}
      process={async (item, signal) => {
        engine.current ??= new ImageEngine();
        const info = item.info!;
        const result = await engine.current.process(
          item.file,
          info,
          { output: { format: output, quality: quality / 100, background: output === 'jpeg' ? background : undefined, webpLossless: output === 'webp' && lossless } },
          signal,
        );
        const r = toItemResult(item.file, result);
        r.notes = [...animationNote(info.format, info.animated), ...r.notes];
        return r;
      }}
    />
  );
}

export default withI18n(ConverterTool);
