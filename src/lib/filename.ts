/**
 * Safe output file names. User-supplied names are never used as paths: directory parts,
 * control characters, bidi overrides, reserved Windows names and trailing dots are removed,
 * and the extension is always chosen by us from the real output format.
 */

const MAX_BASE_LENGTH = 100;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
// C0/C1 control chars, bidi embeddings/overrides/isolates, zero-width & BOM.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
const ILLEGAL_CHARS = /[<>:"/\\|?*]/g;

/** Removes the directory part and the last extension of a user-provided file name. */
export function baseName(name: string): string {
  const leaf = String(name ?? '').split(/[\\/]/).pop() ?? '';
  const dot = leaf.lastIndexOf('.');
  return dot > 0 ? leaf.slice(0, dot) : leaf;
}

/** Returns a file-system-safe base name (no extension) that is never empty. */
export function sanitizeBaseName(name: string, fallback = 'image'): string {
  let s = baseName(name).normalize('NFC');
  s = s.replace(UNSAFE_CHARS, '').replace(ILLEGAL_CHARS, '_');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  // Truncate by code points so surrogate pairs are never split.
  const chars = Array.from(s);
  if (chars.length > MAX_BASE_LENGTH) s = chars.slice(0, MAX_BASE_LENGTH).join('').trim();
  if (!s || WINDOWS_RESERVED.test(s)) s = s ? `${s}_file` : fallback;
  return s;
}

/** Builds `name-suffix.ext` with a safe base and a known extension. */
export function outputName(originalName: string, ext: string, suffix = ''): string {
  const safeExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
  const safeSuffix = suffix ? `-${suffix.replace(/[^a-z0-9-]/gi, '')}` : '';
  return `${sanitizeBaseName(originalName)}${safeSuffix}.${safeExt}`;
}

/** Makes a list of names unique by appending " (2)", " (3)"… before the extension. */
export function uniqueNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return name;
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let candidate = `${stem} (${count + 1})${ext}`;
    let n = count + 1;
    while (seen.has(candidate.toLowerCase())) {
      n += 1;
      candidate = `${stem} (${n})${ext}`;
    }
    seen.set(candidate.toLowerCase(), 1);
    return candidate;
  });
}
