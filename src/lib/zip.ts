import { zipSync, type Zippable } from 'fflate';
import { uniqueNames } from './filename';

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Builds a flat ZIP archive (no folders). Names must already be sanitized; duplicates are
 * renamed. Images are already compressed, so entries are stored without recompression.
 */
export function buildZip(entries: ZipEntry[]): Uint8Array {
  const names = uniqueNames(entries.map((e) => e.name.replace(/[\\/]/g, '_')));
  const files: Zippable = {};
  entries.forEach((entry, i) => {
    files[names[i]] = [entry.data, { level: 0 }];
  });
  return zipSync(files, { level: 0 });
}
