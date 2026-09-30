import { t, withI18n } from '../i18n/runtime';
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

/** Maps the (English, unit-tested) descriptions from lib/metadata to dictionary keys. */
const REMOVED_KEYS: Record<string, string> = {
  'EXIF (camera, date, GPS location…)': 'md.exif',
  'XMP metadata': 'md.xmp',
  'Extended XMP metadata': 'md.xmpExt',
  'APP1 metadata': 'md.app1',
  'ICC colour profile': 'md.icc',
  'Multi-picture index (MPF)': 'md.mpf',
  'APP2 metadata': 'md.app2',
  'IPTC / Photoshop metadata': 'md.iptc',
  'JPEG comment': 'md.comment',
  'Data after end of image (embedded previews, depth or gain maps)': 'md.trailingJpeg',
  'Data after end of image': 'md.trailing',
  'Text metadata (tEXt)': 'md.text',
  'Compressed text metadata (zTXt)': 'md.ztxt',
  'International text / XMP (iTXt)': 'md.itxt',
  'Last-modified timestamp (tIME)': 'md.time',
};

function removedLabel(text: string): string {
  if (REMOVED_KEYS[text]) return t(REMOVED_KEYS[text]);
  const app = text.match(/^APP(\d+) metadata$/);
  if (app) return t('md.appN', { n: app[1] });
  const chunk = text.match(/^Private chunk \((.+)\)$/);
  if (chunk) return t('md.private', { name: chunk[1] });
  return text;
}

function RemoveExifTool() {
  const [keepOrientation, setKeepOrientation] = useState(true);
  const [keepIcc, setKeepIcc] = useState(true);
  const optionsKey = JSON.stringify({ keepOrientation, keepIcc });

  const options = (
    <>
      <Checkbox
        label={t('rx.keepOrientation')}
        checked={keepOrientation}
        onChange={setKeepOrientation}
        hint={t('rx.keepOrientationHint')}
      />
      <Checkbox
        label={t('rx.keepIcc')}
        checked={keepIcc}
        onChange={setKeepIcc}
        hint={t('rx.keepIccHint')}
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
      actionKey="clean"
      zipName="photos-without-metadata.zip"
      wrongFormatMessage={(f) =>
        f === 'heic'
          ? t('rx.heic')
          : t('rx.unsupported', { format: formatLabel(f) })
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
            ? [t('rx.removed', { list: removed.map(removedLabel).join(' · ') }), t('rx.lossless')]
            : [t('rx.none')],
        };
      }}
    />
  );
}

export default withI18n(RemoveExifTool);
