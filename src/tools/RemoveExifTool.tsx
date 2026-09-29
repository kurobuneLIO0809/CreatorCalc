import { useState } from 'preact/hooks';
import { BatchTool } from '../components/tool-ui/BatchTool';
import { Checkbox } from '../components/tool-ui/fields';
import { formatLabel, type DetectedFormat } from '../lib/format';
import { stripJpegMetadata } from '../lib/metadata/jpeg';
import { stripPngMetadata } from '../lib/metadata/png';
import { stripWebpMetadata } from '../lib/metadata/webp';
import { outputName } from '../lib/filename';
import { FORMAT_INFO } from '../lib/format';

const ACCEPT: DetectedFormat[] = ['jpeg', 'png', 'webp'];

export default function RemoveExifTool() {
  const [keepOrientation, setKeepOrientation] = useState(true);
  const [keepIcc, setKeepIcc] = useState(true);
  const optionsKey = JSON.stringify({ keepOrientation, keepIcc });

  const options = (
    <>
      <Checkbox
        label="Keep the orientation flag"
        checked={keepOrientation}
        onChange={setKeepOrientation}
        hint="Keeps photos upright. It only stores a rotation value (1–8) — no personal information."
      />
      <Checkbox
        label="Keep the colour profile"
        checked={keepIcc}
        onChange={setKeepIcc}
        hint="Keeps colours accurate (e.g. iPhone “Display P3” photos). Colour profiles describe the screen/camera colour space, not you."
      />
    </>
  );

  return (
    <BatchTool
      accept={ACCEPT}
      acceptAttr=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
      formatsHint="JPG, PNG, WebP"
      options={options}
      optionsKey={optionsKey}
      actionLabel="Clean"
      zipName="photos-without-metadata.zip"
      wrongFormatMessage={(f) =>
        f === 'heic'
          ? 'HEIC metadata cannot be removed without converting. Use HEIC to JPG — converted files contain no metadata at all.'
          : `${formatLabel(f)} files are not supported. Convert to JPG or PNG with the Image Converter; converted files contain no metadata.`
      }
      process={async (item) => {
        const info = item.info!;
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const { bytes: clean, removed } =
          info.format === 'jpeg'
            ? stripJpegMetadata(bytes, { keepIcc, keepOrientation })
            : info.format === 'png'
              ? stripPngMetadata(bytes, { keepIcc })
              : stripWebpMetadata(bytes, { keepIcc });
        const blob = new Blob([clean as BlobPart], { type: FORMAT_INFO[info.format as 'jpeg'].mime });
        return {
          blob,
          name: outputName(item.file.name, FORMAT_INFO[info.format as 'jpeg'].ext, 'clean'),
          width: info.width,
          height: info.height,
          notes: [],
          details: removed.length
            ? [`Removed: ${removed.join(' · ')}`, 'Image data copied unchanged — no quality loss.']
            : ['No removable metadata was found. The image data is unchanged.'],
        };
      }}
    />
  );
}
