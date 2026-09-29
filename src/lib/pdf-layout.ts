/** Page geometry for Image → PDF, in PDF points (1 pt = 1/72 inch). */

export type PageSizeId = 'a4' | 'letter' | 'image';
export type PageOrientation = 'auto' | 'portrait' | 'landscape';
export type MarginId = 'none' | 'small' | 'large';

export const PAGE_SIZES: Record<Exclude<PageSizeId, 'image'>, { width: number; height: number; label: string }> = {
  a4: { width: 595.28, height: 841.89, label: 'A4 (210 × 297 mm)' },
  letter: { width: 612, height: 792, label: 'US Letter (8.5 × 11 in)' },
};

export const MARGINS: Record<MarginId, number> = { none: 0, small: 18, large: 36 };

/** Images are laid out at 96 px per inch when the page matches the image. */
export const PX_TO_PT = 72 / 96;
/** PDF viewers limit pages to 200 inches per side. */
export const MAX_PAGE_PT = 14_400;

export interface Placement {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computePlacement(
  imageWidth: number,
  imageHeight: number,
  size: PageSizeId,
  orientation: PageOrientation,
  margin: MarginId,
): Placement {
  const m = MARGINS[margin];
  if (size === 'image') {
    let w = imageWidth * PX_TO_PT;
    let h = imageHeight * PX_TO_PT;
    const maxInner = MAX_PAGE_PT - 2 * m;
    const shrink = Math.min(1, maxInner / w, maxInner / h);
    w *= shrink;
    h *= shrink;
    return { pageWidth: w + 2 * m, pageHeight: h + 2 * m, x: m, y: m, width: w, height: h };
  }
  const base = PAGE_SIZES[size];
  const landscape = orientation === 'landscape' || (orientation === 'auto' && imageWidth > imageHeight);
  const pageWidth = landscape ? base.height : base.width;
  const pageHeight = landscape ? base.width : base.height;
  const innerW = pageWidth - 2 * m;
  const innerH = pageHeight - 2 * m;
  const scale = Math.min(innerW / imageWidth, innerH / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { pageWidth, pageHeight, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height };
}
