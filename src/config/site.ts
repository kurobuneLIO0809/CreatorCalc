/**
 * Site-wide configuration. The brand name is provisional — change it here only.
 */
export const site = {
  name: 'QuickConvert',
  tagline: 'Free image tools. No account. Files stay on your device.',
  description:
    'Free online image tools that run in your browser: compress, resize, convert HEIC, WebP, PNG and JPG, make PDFs and remove photo metadata. No sign-up, no upload.',
  locale: 'en_US',
  lang: 'en',
  /** Public issue tracker used as the contact channel until a support email exists. */
  contactUrl: 'https://github.com/kurobuneLIO0809/CreatorCalc/issues',
  sourceUrl: 'https://github.com/kurobuneLIO0809/CreatorCalc',
  /** Date the legal pages were last reviewed (ISO). */
  legalUpdated: '2026-09-29',
  themeColorLight: '#ffffff',
  themeColorDark: '#0f1419',
} as const;

/** Optional features that carry legal or technical trade-offs. */
export const features = {
  /**
   * Bundled HEIC decoder (libheif via heic-to, LGPL-3.0) for browsers without native HEIC support
   * (Chrome, Edge, Firefox). Safari always uses the OS decoder. Set to false to ship without it:
   * HEIC files then only work in Safari and the HEIC to JPG page is removed from the site.
   * See docs/strategy.md "HEIC decision".
   */
  heicDecoder: true,
} as const;

/** Resource limits shared by all image tools. */
export const limits = {
  /** Maximum size of a single input file. */
  maxFileBytes: 100 * 1024 * 1024,
  /** Maximum number of files processed in one batch. */
  maxBatchFiles: 50,
  /** Images whose header reports more pixels than this are rejected before decoding. */
  maxInputPixels: 200_000_000,
  /** Largest canvas we try to allocate on desktop browsers (≈200 MB of RGBA). */
  maxCanvasPixelsDesktop: 50_000_000,
  /** Devices reporting ≤ 4 GB RAM (navigator.deviceMemory, Chromium only). */
  maxCanvasPixelsLowMemory: 24_000_000,
  /** iOS/iPadOS WebKit refuses canvases above ~16.7 MP. */
  maxCanvasPixelsMobileWebKit: 16_777_216,
  /** Longest side accepted by browsers for a canvas dimension. */
  maxCanvasSide: 32_767,
  /** PNG colour quantization is memory-hungry; above this, lossless PNG is used instead. */
  maxQuantizePixels: 20_000_000,
  /** Everything held in memory at once when building a PDF or ZIP. */
  maxCombinedBytes: 400 * 1024 * 1024,
} as const;
