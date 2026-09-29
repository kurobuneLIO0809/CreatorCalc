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

export default function CompressorTool() {
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
          label="Output format"
          value={format}
          onChange={setFormat}
          options={[
            { value: 'same', label: 'Same as original' },
            { value: 'jpeg', label: 'JPG' },
            { value: 'webp', label: 'WebP' },
            { value: 'png', label: 'PNG' },
          ]}
          hint="WebP is usually 25–35% smaller than JPG at similar quality. PNG input keeps its transparency unless you pick JPG."
        />
        <Slider
          label="Quality (JPG / WebP)"
          value={quality}
          min={10}
          max={95}
          suffix="%"
          onChange={setQuality}
          hint="70–80% is a good balance for photos. Lower = smaller file, more visible artifacts."
        />
        <Select
          label="PNG colours"
          value={colors}
          onChange={setColors}
          options={[
            { value: '256', label: '256 colours (recommended)' },
            { value: '128', label: '128 colours' },
            { value: '64', label: '64 colours' },
            { value: '32', label: '32 colours (flat graphics)' },
            { value: '0', label: 'Lossless (no colour reduction)' },
          ]}
          hint={pngSelected || format === 'same' ? 'PNG files are made smaller by reducing them to a palette of colours, which keeps transparency.' : 'Only used when the output is PNG.'}
        />
        <Select
          label="Also limit the longest side"
          value={maxSide}
          onChange={setMaxSide}
          options={[
            { value: 'none', label: "Don't resize" },
            { value: '3840', label: '3840 px (4K)' },
            { value: '2560', label: '2560 px' },
            { value: '1920', label: '1920 px (Full HD)' },
            { value: '1280', label: '1280 px' },
            { value: '1024', label: '1024 px' },
            { value: '800', label: '800 px' },
          ]}
          hint="Resizing a phone photo to 1920 px often saves more than lowering quality. Smaller images are never enlarged."
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
      actionLabel="Compress"
      zipName="compressed-images.zip"
      compare
      showSavings
      wrongFormatMessage={(f) =>
        f === 'heic' ? 'HEIC photos are already highly compressed. Use “Compress to exact KB” or “HEIC to JPG” instead.' : f === 'gif' ? 'GIF compression (with animation) is not supported yet — only JPG, PNG, WebP and BMP.' : undefined
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
          return keepOriginal(item.file, info.format, 'This file is already well optimised — compressing it again would make it larger, so the original was kept unchanged.');
        }
        const r = toItemResult(item.file, result, 'compressed');
        r.notes = [...animationNote(info.format, info.animated), ...r.notes];
        return r;
      }}
    />
  );
}
