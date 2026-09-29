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
  hint: string;
  outputs: OutputFormat[];
  defaultOutput: OutputFormat;
  defaultQuality: number;
  zipName: string;
  showSavings?: boolean;
  wrongFormat?: (f: DetectedFormat) => string | undefined;
}

const toConverter = (f: DetectedFormat) =>
  `This is a ${formatLabel(f)} file. Use the Image Converter to convert ${formatLabel(f)} images.`;

const CONFIGS: Record<ConverterId, ConverterConfig> = {
  'image-converter': {
    accept: [...RASTER_INPUTS, 'tiff'],
    acceptAttr: `${RASTER_ACCEPT_ATTR},.tif,.tiff`,
    hint: `${RASTER_HINT}, TIFF (Safari)`,
    outputs: ['jpeg', 'png', 'webp'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'converted-images.zip',
  },
  'heic-to-jpg': {
    accept: ['heic'],
    acceptAttr: '.heic,.heif,image/heic,image/heif',
    hint: 'HEIC / HEIF photos from iPhone or iPad',
    outputs: ['jpeg', 'png'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'heic-to-jpg.zip',
    wrongFormat: (f) => (f === 'jpeg' ? sameFormatMessage(f) : `This is a ${formatLabel(f)} file, not HEIC. Use the Image Converter for ${formatLabel(f)} images.`),
  },
  'webp-to-jpg': {
    accept: ['webp'],
    acceptAttr: '.webp,image/webp',
    hint: 'WebP images (animated WebP: first frame)',
    outputs: ['jpeg', 'png'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    zipName: 'webp-to-jpg.zip',
    wrongFormat: (f) => (f === 'jpeg' ? sameFormatMessage(f) : toConverter(f)),
  },
  'png-to-jpg': {
    accept: ['png'],
    acceptAttr: '.png,image/png',
    hint: 'PNG images',
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
    hint: 'JPG / JPEG images',
    outputs: ['png'],
    defaultOutput: 'png',
    defaultQuality: 100,
    zipName: 'jpg-to-png.zip',
    wrongFormat: (f) => (f === 'png' ? sameFormatMessage(f) : toConverter(f)),
  },
  'image-to-webp': {
    accept: ['jpeg', 'png', 'bmp', 'gif'],
    acceptAttr: '.jpg,.jpeg,.png,.bmp,.gif,image/jpeg,image/png,image/bmp,image/gif',
    hint: 'JPG, PNG, BMP, GIF',
    outputs: ['webp'],
    defaultOutput: 'webp',
    defaultQuality: 80,
    zipName: 'webp-images.zip',
    showSavings: true,
    wrongFormat: (f) => (f === 'webp' ? sameFormatMessage(f) : toConverter(f)),
  },
};

export default function ConverterTool({ id }: { id: ConverterId }) {
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
          <Segmented<OutputFormat> label="Convert to" value={output} onChange={setOutput} options={OUTPUT_OPTIONS.filter((o) => cfg.outputs.includes(o.value))} />
        )}
        {output === 'webp' && (
          <Checkbox
            label="Lossless WebP"
            checked={lossless}
            onChange={setLossless}
            hint="Best for screenshots, logos and graphics with sharp edges. Photos are much smaller with lossy WebP."
          />
        )}
        {lossy && (
          <Slider
            label="Quality"
            value={quality}
            min={30}
            max={100}
            suffix="%"
            onChange={setQuality}
            hint={output === 'jpeg' ? '90% looks identical to the original for almost all photos.' : '75–85% is a good default for websites.'}
          />
        )}
        {output === 'jpeg' && (
          <ColorField label="Background for transparent areas" value={background} onChange={setBackground} hint="JPG cannot store transparency, so transparent pixels are filled with this colour." />
        )}
        {output === 'png' && id === 'jpg-to-png' && (
          <p class="field__hint">
            PNG output is lossless: it keeps the JPG exactly as it is now. It will not restore detail lost in the JPG or make the background transparent.
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
      formatsHint={cfg.hint}
      options={options}
      optionsKey={optionsKey}
      actionLabel="Convert"
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
