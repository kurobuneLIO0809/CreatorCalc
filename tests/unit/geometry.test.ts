import { computePlacement, MAX_PAGE_PT } from '../../src/lib/pdf-layout';
import { centeredAspectRect, clampRect, computeResize, dragRect, fitScale, normalizeRotation, rotatedSize } from '../../src/lib/resize';

describe('computeResize', () => {
  const src = { width: 4000, height: 3000 };

  it('resizes by percentage', () => {
    expect(computeResize(src, { mode: 'percent', percent: 50 })).toEqual({ width: 2000, height: 1500 });
    expect(computeResize(src, { mode: 'percent', percent: 0 })).toEqual(src);
  });

  it('fits inside a box when keeping aspect ratio', () => {
    expect(computeResize(src, { mode: 'dimensions', width: 1920, height: 1080, keepAspect: true })).toEqual({ width: 1440, height: 1080 });
    expect(computeResize(src, { mode: 'dimensions', width: 800, keepAspect: true })).toEqual({ width: 800, height: 600 });
    expect(computeResize(src, { mode: 'dimensions', height: 300, keepAspect: true })).toEqual({ width: 400, height: 300 });
  });

  it('stretches when aspect is not kept', () => {
    expect(computeResize(src, { mode: 'dimensions', width: 100, height: 100, keepAspect: false })).toEqual({ width: 100, height: 100 });
    expect(computeResize(src, { mode: 'dimensions', width: 100, keepAspect: false })).toEqual({ width: 100, height: 3000 });
  });

  it('limits the longest side', () => {
    expect(computeResize({ width: 3000, height: 4000 }, { mode: 'longest', longest: 1000 })).toEqual({ width: 750, height: 1000 });
  });

  it('prevents upscaling when requested', () => {
    expect(computeResize({ width: 200, height: 100 }, { mode: 'dimensions', width: 1000, keepAspect: true }, false)).toEqual({ width: 200, height: 100 });
    expect(computeResize({ width: 200, height: 100 }, { mode: 'dimensions', width: 1000, keepAspect: true }, true)).toEqual({ width: 1000, height: 500 });
  });

  it('never returns zero-sized output', () => {
    expect(computeResize({ width: 1000, height: 1 }, { mode: 'percent', percent: 1 })).toEqual({ width: 10, height: 1 });
  });
});

describe('fitScale / rotation / crop helpers', () => {
  it('scales down to a pixel budget', () => {
    const s = fitScale({ width: 8064, height: 6048 }, 16_777_216);
    expect(8064 * s * 6048 * s).toBeLessThanOrEqual(16_777_216 + 1);
    expect(fitScale({ width: 100, height: 100 }, 16_777_216)).toBe(1);
    expect(fitScale({ width: 40000, height: 100 }, 1e9, 32767)).toBeCloseTo(32767 / 40000);
  });

  it('normalizes rotation', () => {
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(450)).toBe(90);
    expect(rotatedSize({ width: 3, height: 2 }, 90)).toEqual({ width: 2, height: 3 });
    expect(rotatedSize({ width: 3, height: 2 }, 180)).toEqual({ width: 3, height: 2 });
  });

  it('clamps crop rectangles into bounds', () => {
    expect(clampRect({ x: -10, y: 5, width: 500, height: 50 }, { width: 100, height: 40 })).toEqual({ x: 0, y: 5, width: 100, height: 35 });
    expect(centeredAspectRect({ width: 400, height: 300 }, 1)).toEqual({ x: 50, y: 0, width: 300, height: 300 });
    expect(centeredAspectRect({ width: 400, height: 300 }, 16 / 9)).toEqual({ x: 0, y: 38, width: 400, height: 225 });
  });
});

describe('computePlacement (image to PDF)', () => {
  it('centers a landscape photo on an auto-rotated A4 page', () => {
    const p = computePlacement(4000, 3000, 'a4', 'auto', 'none');
    expect(p.pageWidth).toBeCloseTo(841.89);
    expect(p.pageHeight).toBeCloseTo(595.28);
    expect(p.height).toBeCloseTo(595.28);
    expect(p.x).toBeCloseTo((841.89 - p.width) / 2);
  });

  it('respects forced orientation and margins', () => {
    const p = computePlacement(4000, 3000, 'letter', 'portrait', 'large');
    expect(p.pageWidth).toBe(612);
    expect(p.width).toBeCloseTo(612 - 72);
    expect(p.y).toBeCloseTo((792 - p.height) / 2);
  });

  it('matches the page to the image at 96 DPI and caps huge pages', () => {
    const p = computePlacement(960, 480, 'image', 'auto', 'none');
    expect(p).toMatchObject({ pageWidth: 720, pageHeight: 360, x: 0, y: 0 });
    const huge = computePlacement(40000, 1000, 'image', 'auto', 'small');
    expect(huge.pageWidth).toBeLessThanOrEqual(MAX_PAGE_PT);
  });
});

describe('dragRect (crop frame gestures)', () => {
  const bounds = { width: 1000, height: 800 };
  const start = { x: 100, y: 100, width: 400, height: 300 };

  it('moves the frame and keeps it inside the image', () => {
    expect(dragRect('move', start, 50, -20, bounds)).toEqual({ x: 150, y: 80, width: 400, height: 300 });
    expect(dragRect('move', start, 5000, 5000, bounds)).toEqual({ x: 600, y: 500, width: 400, height: 300 });
    expect(dragRect('move', start, -5000, 0, bounds).x).toBe(0);
  });

  it('resizes from edges and corners with a minimum size', () => {
    expect(dragRect('e', start, 100, 0, bounds)).toEqual({ x: 100, y: 100, width: 500, height: 300 });
    expect(dragRect('nw', start, -50, -50, bounds)).toEqual({ x: 50, y: 50, width: 450, height: 350 });
    expect(dragRect('w', start, 1000, 0, bounds).width).toBe(8);
    expect(dragRect('se', start, 5000, 5000, bounds)).toEqual({ x: 100, y: 100, width: 900, height: 700 });
  });

  it('keeps the aspect ratio on corner drags and stays in bounds', () => {
    const r = dragRect('se', { x: 0, y: 0, width: 300, height: 300 }, 200, 0, bounds, 1);
    expect(r.width).toBeCloseTo(r.height);
    const big = dragRect('se', { x: 0, y: 0, width: 300, height: 300 }, 5000, 5000, bounds, 1);
    expect(big).toEqual({ x: 0, y: 0, width: 800, height: 800 });
    const nw = dragRect('nw', { x: 500, y: 400, width: 200, height: 200 }, -1000, -1000, bounds, 16 / 9);
    expect(nw.y).toBeGreaterThanOrEqual(0);
    expect(nw.width / nw.height).toBeCloseTo(16 / 9);
  });
});
