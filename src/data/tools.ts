import { features } from '../config/site';
import type { CategoryId } from './categories';

export type ToolSlug =
  | 'image-compressor'
  | 'compress-image-to-kb'
  | 'image-resizer'
  | 'image-converter'
  | 'heic-to-jpg'
  | 'webp-to-jpg'
  | 'png-to-jpg'
  | 'jpg-to-png'
  | 'image-to-webp'
  | 'image-to-pdf'
  | 'image-cropper'
  | 'rotate-image'
  | 'exif-viewer'
  | 'remove-exif';

export type ToolIcon = 'compress' | 'target' | 'resize' | 'convert' | 'pdf' | 'crop' | 'rotate' | 'info' | 'shield';

export interface ToolMeta {
  slug: ToolSlug;
  category: CategoryId;
  /** Short name used in cards and navigation. */
  name: string;
  /** Page H1. */
  h1: string;
  /** <title> — written for the searcher's intent, ~50–60 chars. */
  title: string;
  /** Meta description, ~140–160 chars. */
  description: string;
  /** One-sentence summary shown under the H1 and on cards. */
  tagline: string;
  icon: ToolIcon;
  popular?: boolean;
  /** Extra words for the on-site search box (not used as meta keywords). */
  searchTerms: string[];
  related: ToolSlug[];
  /** Date of the last meaningful change to the tool or its content (used for sitemap lastmod). */
  updated: string;
}

const allTools: ToolMeta[] = [
  {
    slug: 'image-compressor',
    category: 'image',
    name: 'Image Compressor',
    h1: 'Image Compressor',
    title: 'Compress Images Online – JPG, PNG & WebP, No Upload',
    description: 'Reduce JPG, PNG and WebP file sizes in your browser. Batch compress, compare before/after and download — free, no sign-up, files never uploaded.',
    tagline: 'Make JPG, PNG and WebP files smaller without visible quality loss.',
    icon: 'compress',
    popular: true,
    searchTerms: ['compress', 'reduce size', 'optimize', 'shrink', 'smaller', 'tinypng'],
    related: ['compress-image-to-kb', 'image-resizer', 'image-to-webp', 'remove-exif'],
    updated: '2026-09-29',
  },
  {
    slug: 'compress-image-to-kb',
    category: 'image',
    name: 'Compress to Exact KB',
    h1: 'Compress an Image to a Specific Size (KB)',
    title: 'Compress Image to 20KB, 50KB, 100KB or Any Size – Free',
    description: 'Hit an upload limit exactly: compress a photo to under 20KB, 50KB, 100KB, 200KB or any size you type. Works on phones, runs in your browser.',
    tagline: 'Type a size limit and get the best-quality image that fits under it.',
    icon: 'target',
    popular: true,
    searchTerms: ['kb', '100kb', '50kb', '20kb', '200kb', 'passport', 'form', 'upload limit', 'target size', 'reduce kb'],
    related: ['image-compressor', 'image-resizer', 'image-cropper', 'heic-to-jpg'],
    updated: '2026-09-29',
  },
  {
    slug: 'image-resizer',
    category: 'image',
    name: 'Image Resizer',
    h1: 'Image Resizer',
    title: 'Resize Image Online – Change Pixels or Percentage, Free',
    description: 'Resize JPG, PNG, WebP and HEIC images by pixels or percentage. Keep the aspect ratio, batch resize many photos and download instantly. No upload.',
    tagline: 'Change image dimensions by pixels or percentage, one photo or a whole batch.',
    icon: 'resize',
    popular: true,
    searchTerms: ['resize', 'dimensions', 'pixels', 'scale', 'width', 'height', 'shrink', 'enlarge'],
    related: ['image-cropper', 'image-compressor', 'compress-image-to-kb', 'rotate-image'],
    updated: '2026-09-29',
  },
  {
    slug: 'image-converter',
    category: 'image',
    name: 'Image Converter',
    h1: 'Image Converter',
    title: 'Image Converter – HEIC, WebP, PNG, JPG, AVIF Online',
    description: 'Convert images between JPG, PNG and WebP. Opens HEIC, AVIF, GIF and BMP too. Batch conversion in your browser — free, private, no account.',
    tagline: 'Convert almost any image to JPG, PNG or WebP in one step.',
    icon: 'convert',
    popular: true,
    searchTerms: ['convert', 'format', 'change format', 'avif', 'bmp', 'gif', 'webp to png', 'jpeg'],
    related: ['heic-to-jpg', 'webp-to-jpg', 'png-to-jpg', 'image-to-webp'],
    updated: '2026-09-29',
  },
  {
    slug: 'heic-to-jpg',
    category: 'image',
    name: 'HEIC to JPG',
    h1: 'HEIC to JPG Converter',
    title: 'HEIC to JPG Converter – Free, Batch, No Upload',
    description: 'Convert iPhone HEIC photos to JPG in your browser. Batch convert and download as ZIP. Your photos stay on your device — no upload, no sign-up.',
    tagline: 'Turn iPhone HEIC photos into JPGs that open everywhere.',
    icon: 'convert',
    popular: true,
    searchTerms: ['heic', 'heif', 'iphone', 'ios', 'apple', 'live photo', 'jpeg'],
    related: ['compress-image-to-kb', 'image-converter', 'remove-exif', 'image-to-pdf'],
    updated: '2026-09-29',
  },
  {
    slug: 'webp-to-jpg',
    category: 'image',
    name: 'WebP to JPG',
    h1: 'WebP to JPG Converter',
    title: 'WebP to JPG Converter – Free Online, Batch, No Upload',
    description: 'Convert WebP images to JPG so they open in any app or upload form. Batch convert, choose quality and background colour. Runs in your browser.',
    tagline: 'Convert WebP images saved from websites into regular JPGs.',
    icon: 'convert',
    popular: true,
    searchTerms: ['webp', 'jpeg', 'google image', 'save as jpg', 'webp to png'],
    related: ['image-converter', 'image-to-webp', 'png-to-jpg', 'image-compressor'],
    updated: '2026-09-29',
  },
  {
    slug: 'png-to-jpg',
    category: 'image',
    name: 'PNG to JPG',
    h1: 'PNG to JPG Converter',
    title: 'PNG to JPG Converter – Choose Background, Free & Private',
    description: 'Convert PNG to JPG in your browser. Pick the background colour for transparent areas and the JPG quality. Batch conversion, no upload, no sign-up.',
    tagline: 'Convert PNG screenshots and graphics into smaller JPG files.',
    icon: 'convert',
    searchTerms: ['png', 'jpeg', 'transparent', 'screenshot', 'smaller'],
    related: ['jpg-to-png', 'image-compressor', 'image-converter', 'webp-to-jpg'],
    updated: '2026-09-29',
  },
  {
    slug: 'jpg-to-png',
    category: 'image',
    name: 'JPG to PNG',
    h1: 'JPG to PNG Converter',
    title: 'JPG to PNG Converter – Free, Lossless Output, No Upload',
    description: 'Convert JPG images to PNG in your browser. Learn what PNG can and cannot do for your photo (quality, transparency). Batch conversion, free and private.',
    tagline: 'Save JPG images as lossless PNG files for editing or apps that require PNG.',
    icon: 'convert',
    searchTerms: ['jpg', 'jpeg', 'png', 'lossless', 'transparent'],
    related: ['png-to-jpg', 'image-converter', 'image-cropper', 'image-to-webp'],
    updated: '2026-09-29',
  },
  {
    slug: 'image-to-webp',
    category: 'image',
    name: 'JPG/PNG to WebP',
    h1: 'Convert JPG & PNG to WebP',
    title: 'JPG & PNG to WebP Converter – Lossy or Lossless, Free',
    description: 'Convert JPG and PNG images to WebP for faster websites. Lossy or lossless, batch conversion, real WebP output even where Safari cannot encode it. No upload.',
    tagline: 'Create lightweight WebP images for websites and blogs.',
    icon: 'convert',
    searchTerms: ['webp', 'jpg to webp', 'png to webp', 'website', 'page speed', 'optimize'],
    related: ['image-compressor', 'webp-to-jpg', 'image-resizer', 'image-converter'],
    updated: '2026-09-29',
  },
  {
    slug: 'image-to-pdf',
    category: 'image',
    name: 'Image to PDF',
    h1: 'Image to PDF (JPG to PDF)',
    title: 'JPG to PDF – Combine Images into One PDF, Free & Private',
    description: 'Combine JPG, PNG, WebP and HEIC images into a single PDF. Reorder pages, pick A4 or Letter and margins. Original JPG quality kept. No upload.',
    tagline: 'Combine photos and scans into a single PDF document.',
    icon: 'pdf',
    popular: true,
    searchTerms: ['pdf', 'jpg to pdf', 'png to pdf', 'combine', 'merge', 'scan', 'document', 'photos to pdf'],
    related: ['compress-image-to-kb', 'image-cropper', 'rotate-image', 'heic-to-jpg'],
    updated: '2026-09-29',
  },
  {
    slug: 'image-cropper',
    category: 'image',
    name: 'Image Cropper',
    h1: 'Crop Image',
    title: 'Crop Image Online – Square, 16:9, 4:5 or Custom, Free',
    description: 'Crop photos to a square, 16:9, 4:5 or any custom size with touch-friendly handles or exact pixel values. Runs in your browser — no upload.',
    tagline: 'Cut an image to the exact area and aspect ratio you need.',
    icon: 'crop',
    searchTerms: ['crop', 'cut', 'trim', 'square', 'aspect ratio', 'profile picture', 'instagram'],
    related: ['image-resizer', 'rotate-image', 'compress-image-to-kb', 'image-compressor'],
    updated: '2026-09-29',
  },
  {
    slug: 'rotate-image',
    category: 'image',
    name: 'Rotate & Flip',
    h1: 'Rotate or Flip an Image',
    title: 'Rotate Image Online – Rotate 90°/180° or Flip, Free',
    description: 'Rotate images 90° or 180°, or mirror them horizontally or vertically. Fix sideways photos in a batch — free, in your browser, no upload.',
    tagline: 'Fix sideways or mirrored photos — one image or many at once.',
    icon: 'rotate',
    searchTerms: ['rotate', 'flip', 'mirror', 'sideways', 'upside down', 'turn'],
    related: ['image-cropper', 'image-resizer', 'image-to-pdf', 'remove-exif'],
    updated: '2026-09-29',
  },
  {
    slug: 'exif-viewer',
    category: 'image',
    name: 'EXIF Viewer',
    h1: 'EXIF Viewer – See Photo Metadata',
    title: 'EXIF Viewer – Check Photo Metadata & GPS Location Online',
    description: 'See the hidden metadata in a photo: camera, date taken, GPS location, lens and settings. Works with JPG, HEIC, PNG and WebP. Nothing is uploaded.',
    tagline: 'See what hidden information — camera, date, GPS location — a photo contains.',
    icon: 'info',
    searchTerms: ['exif', 'metadata', 'gps', 'location', 'camera', 'date taken', 'photo info'],
    related: ['remove-exif', 'image-compressor', 'heic-to-jpg', 'image-converter'],
    updated: '2026-09-29',
  },
  {
    slug: 'remove-exif',
    category: 'image',
    name: 'Remove EXIF',
    h1: 'Remove EXIF & GPS Data from Photos',
    title: 'Remove EXIF Data & Location from Photos – Lossless, Free',
    description: 'Strip GPS location, camera details and other metadata from JPG, PNG and WebP without re-compressing. Batch, in your browser — photos never uploaded.',
    tagline: 'Delete location and camera metadata before you share a photo — without losing quality.',
    icon: 'shield',
    popular: true,
    searchTerms: ['exif', 'metadata', 'gps', 'location', 'privacy', 'strip', 'remove', 'geotag'],
    related: ['exif-viewer', 'image-compressor', 'heic-to-jpg', 'image-cropper'],
    updated: '2026-09-29',
  },
];

/** Tools that depend on an optional feature are only published when it is enabled. */
const isEnabled = (t: ToolMeta) => t.slug !== 'heic-to-jpg' || features.heicDecoder;
export const tools: ToolMeta[] = allTools.filter(isEnabled).map((t) => ({ ...t, related: t.related.filter((r) => allTools.some((x) => x.slug === r && isEnabled(x))) }));

export const toolBySlug = new Map(tools.map((t) => [t.slug, t]));

export function getTool(slug: ToolSlug): ToolMeta {
  const tool = toolBySlug.get(slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export const toolPath = (slug: ToolSlug) => `/tools/${slug}`;
