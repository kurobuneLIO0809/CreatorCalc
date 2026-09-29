/**
 * Hand-written page content for each tool. Every statement here must match what the
 * code actually does — update this file whenever a tool's behaviour changes.
 */
import type { ToolSlug } from './tools';

export interface ToolContent {
  /** Short paragraphs explaining what the tool is for (shown below the tool). */
  intro: string[];
  steps: string[];
  useCases: Array<{ title: string; text: string }>;
  specs: Array<[string, string]>;
  limits: string[];
  faq: Array<{ q: string; a: string }>;
}

const PRIVACY_SPEC: [string, string] = ['Where processing happens', 'In your browser, on your device. Files are not uploaded.'];
const SIZE_SPEC: [string, string] = ['File limits', 'Up to 100 MB per file and 50 files per batch'];

export const content: Record<ToolSlug, ToolContent> = {
  'image-compressor': {
    intro: [
      'Large photos are slow to email, fill up storage, and are often rejected by websites. This compressor re-encodes your images at a quality level you choose, and can optionally cap the pixel dimensions — which is usually where the biggest savings come from for phone photos.',
      'Every result shows the size before and after. If a file is already well optimised and compressing it again would make it bigger, the original is returned unchanged instead of a worse copy.',
    ],
    steps: [
      'Choose or drop one or more JPG, PNG, WebP or BMP files. Compression starts immediately with balanced settings.',
      'Adjust the quality, output format or maximum size. With up to three images the preview updates automatically; for larger batches press “Apply settings”.',
      'Use “Compare” to check the result against the original, then download files one by one or all together as a ZIP.',
    ],
    useCases: [
      { title: 'Email attachments', text: 'Shrink a batch of 5 MB phone photos so a dozen of them fit under a 25 MB attachment limit.' },
      { title: 'Faster websites', text: 'Reduce hero images and blog photos — choose WebP output for the smallest files modern browsers support.' },
      { title: 'Screenshots and graphics', text: 'PNG screenshots with large flat areas often shrink by 60–80% when reduced to a 256-colour palette, with transparency kept.' },
    ],
    specs: [
      ['Input formats', 'JPG/JPEG, PNG, WebP, BMP'],
      ['Output formats', 'Same as original, JPG, WebP or PNG'],
      ['JPG / WebP method', 'Re-encoded at the quality you choose (10–95%) using the browser’s built-in encoder; WebP falls back to a WebAssembly encoder on Safari/iOS'],
      ['PNG method', 'Colour quantization to a palette of 32–256 colours (lossy but keeps transparency), or lossless re-encoding'],
      ['Optional resizing', 'Longest side capped at 800–3840 px; smaller images are never enlarged'],
      ['Metadata', 'Re-encoded files contain no EXIF/GPS metadata'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Compression is lossy: at low quality settings, JPG and WebP show blocky or blurry areas. Use “Compare” before downloading.',
      'Animated GIF and HEIC files are not accepted by this tool. HEIC photos are already highly compressed — use “HEIC to JPG” or “Compress to exact KB” instead.',
      'Colour profiles are converted to standard sRGB. Wide-gamut (Display P3) photos may look very slightly less saturated on wide-gamut screens.',
      'Very large images (above ~16 megapixels on iPhone/iPad) are automatically scaled down to fit the browser’s memory limit; a note is shown when this happens.',
    ],
    faq: [
      { q: 'Are my images uploaded to a server?', a: 'No. The images are decoded and encoded by your browser (in a background worker) on your own device. The page has no upload endpoint, and its security policy blocks sending data to other websites.' },
      { q: 'What quality setting should I use?', a: 'For photos, 70–80% is usually indistinguishable from the original at normal viewing size while cutting the file size substantially. For images with text, try 85% or use PNG.' },
      { q: 'Why did one of my files come back unchanged?', a: 'If compressing a file with your settings would produce a larger file than the original (common with already-optimised JPGs), we keep the original so you never download something worse and bigger.' },
      { q: 'Is WebP better than JPG?', a: 'WebP is typically 25–35% smaller than JPG at similar visual quality and is supported by all current browsers. Some older apps and many upload forms still only accept JPG, so keep JPG when in doubt.' },
      { q: 'Does compressing remove the location data from my photo?', a: 'Yes. Re-encoded images are written from pixels only, so EXIF data such as GPS coordinates, camera model and date are not copied. If you want to remove metadata without re-compressing, use the Remove EXIF tool.' },
    ],
  },

  'compress-image-to-kb': {
    intro: [
      'Passport and visa portals, exam and job applications and many government sites reject photos above a fixed size such as 20 KB, 50 KB or 100 KB. Guessing a quality setting and trying again wastes time — this tool searches for the highest-quality version that fits under the limit you type.',
      'It first tries high quality at full size. If that is too big it lowers the JPG/WebP quality step by step, and only if the minimum quality still does not fit does it reduce the pixel dimensions. The final size in bytes is shown so you can check it against the form’s rule.',
    ],
    steps: [
      'Pick a preset (20 KB, 50 KB, 100 KB, 200 KB, 500 KB, 1 MB) or type your own limit.',
      'Choose or drop your photo — JPG, PNG, HEIC from iPhone, WebP and more are accepted.',
      'Download the result. The row shows the exact byte count and whether it fits the limit.',
    ],
    useCases: [
      { title: 'Passport and visa forms', text: 'Many online applications require a JPG under 100–240 KB. Check the form’s pixel requirements too — crop first if a specific shape is required.' },
      { title: 'Exam and job portals', text: 'Signature and photo uploads often have strict 10–50 KB limits. Crop tightly first so the remaining pixels get the quality budget.' },
      { title: 'Messaging and forums', text: 'Some sites limit avatars or attachments to 500 KB or 1 MB. Set the limit once and drop several images.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP'],
      ['Output formats', 'JPG (default) or WebP'],
      ['How the size is reached', 'Binary search over quality (40–92%), then proportional downscaling if needed'],
      ['KB definition', 'The limit is treated as 1 KB = 1,000 bytes, so a “100 KB” result is ≤ 100,000 bytes and passes forms that count 1 KB as 1,024 bytes as well'],
      ['Smallest limit', '5 KB'],
      ['Metadata', 'Output contains no EXIF/GPS metadata'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Very small limits (under ~20 KB) require reducing the pixel dimensions; the result can look soft. Crop away background first to keep the face or signature sharp.',
      'If the form also requires exact pixel dimensions (for example 600 × 600), resize or crop to those first, then compress to the size limit.',
      'Transparent areas become white, because JPG has no transparency.',
    ],
    faq: [
      { q: 'How do I compress a photo to exactly 100 KB?', a: 'Select “100 KB”, then choose your photo. The tool returns the best-quality version that is at most 100,000 bytes. It is usually a little under the limit — an exact byte count is not needed, as forms check for “not larger than”.' },
      { q: 'The result says “Target not reached”. What can I do?', a: 'This happens with tiny limits and very detailed images. Crop the image to the important part, or choose a slightly larger limit if the form allows it.' },
      { q: 'Why is my 100 KB file shown as 97.6 KB on my computer?', a: 'Operating systems count 1 KB as either 1,000 or 1,024 bytes. We keep files at or below the limit in both systems, so a 100,000-byte file may be displayed as 97.6 KB by Windows.' },
      { q: 'Can I use my iPhone HEIC photo?', a: 'Yes. HEIC photos are decoded in your browser (natively on Safari, with a bundled decoder elsewhere) and saved as JPG, which almost every form accepts.' },
      { q: 'Is it safe to use for ID or passport photos?', a: 'The photo is processed entirely on your device and never uploaded to our servers. Nothing is stored after you close the tab.' },
    ],
  },

  'image-resizer': {
    intro: [
      'Resize images to exact pixel dimensions, to a percentage of their size, or to fit inside a box such as 1920 × 1080 while keeping the proportions. Every image in a batch gets the same rule, so a folder of photos can be prepared for a website or shop in one go.',
      'Downscaling uses a multi-step high-quality filter, which avoids the jagged edges that single-step resizing produces for large reductions.',
    ],
    steps: [
      'Choose or drop your images.',
      'Pick “Pixels” and enter a width and/or height (or choose a preset), or pick “Percentage”. The new size of the first image is shown as a preview.',
      'Press “Resize”, then download each image or all of them as a ZIP.',
    ],
    useCases: [
      { title: 'Websites and online shops', text: 'Product photos straight from a phone are often 4000 px wide. 1200–2000 px is plenty for most sites and loads far faster.' },
      { title: 'Social media', text: 'Presets for 1080 × 1080 square posts, 1080 × 1350 portrait posts and 1080 × 1920 stories. Images are fitted inside — use Crop for an exact shape.' },
      { title: 'Forms with pixel limits', text: 'Some applications require, for example, a maximum of 800 × 600 px. Enter both values with “keep aspect ratio” on and nothing will be cut off.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP'],
      ['Resize modes', 'Width and/or height in pixels (fit inside or stretch), or percentage (1–400%)'],
      ['Maximum output size', '20,000 px per side (and the browser’s memory limit)'],
      ['Upscaling', 'Off by default (“Don’t enlarge images that are already smaller”)'],
      ['Output formats', 'Same as original, JPG, PNG or WebP (HEIC/AVIF → JPG, GIF/BMP → PNG when “same”)'],
      ['Resampling', 'Progressive halving + high-quality browser smoothing'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Enlarging an image cannot add detail; upscaled images look soft.',
      'With “keep aspect ratio” on, the image fits inside the width × height box, so one side may be smaller than entered. Turn it off to stretch, or use the Crop tool to cut to an exact ratio.',
      'Animated GIF and WebP files are resized as a still image (first frame).',
    ],
    faq: [
      { q: 'How do I resize an image without losing quality?', a: 'Reducing size always discards pixels, but with high-quality resampling and 90% JPG quality (the default) the result looks sharp at its new size. For graphics and screenshots choose PNG output, which is lossless.' },
      { q: 'Can I resize many images at once?', a: 'Yes — up to 50 images per batch. All of them receive the same resize rule, and you can download them together as a ZIP file.' },
      { q: 'What does “keep aspect ratio” do?', a: 'It keeps the width-to-height proportion of each photo, so people and objects are not stretched. If you enter both width and height, the image is scaled to fit inside that box.' },
      { q: 'Does resizing reduce the file size?', a: 'Usually by a lot: halving the width and height leaves a quarter of the pixels, and the file typically shrinks by 60–75%.' },
    ],
  },

  'image-converter': {
    intro: [
      'A single converter for everyday image formats: open HEIC photos from an iPhone, AVIF and WebP images from the web, GIF or BMP files, and save them as JPG, PNG or WebP. Drop several files of different formats at once — each is converted with the same output settings.',
      'Looking for a specific conversion? The dedicated pages below explain the details for the most common ones: HEIC to JPG, WebP to JPG, PNG to JPG, JPG to PNG and JPG/PNG to WebP.',
    ],
    steps: [
      'Choose the output format: JPG, PNG or WebP.',
      'Choose or drop your images. Conversion starts right away.',
      'Download the converted files individually or as a ZIP.',
    ],
    useCases: [
      { title: 'Mixed folders', text: 'Convert a mixture of HEIC, WebP and PNG images to JPG for an app or printer that only accepts JPG.' },
      { title: 'Keeping transparency', text: 'Choose PNG or WebP output to keep transparent backgrounds from PNG, WebP, GIF or AVIF inputs.' },
      { title: 'Modern formats', text: 'Turn AVIF or WebP images from websites into formats older software can open.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP; TIFF only in browsers that can decode it (Safari)'],
      ['Output formats', 'JPG, PNG, WebP (lossy or lossless)'],
      ['Transparency', 'Kept for PNG/WebP output; filled with a colour of your choice for JPG'],
      ['Detection', 'Formats are detected from the file’s content, not its extension'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Animated GIF/WebP/PNG files are converted as a single still image.',
      'Output cannot be HEIC or AVIF (browsers cannot encode these formats yet).',
      'SVG, PDF, RAW camera files and PSD are not supported.',
    ],
    faq: [
      { q: 'Which format should I choose?', a: 'JPG for photos that need to open everywhere, PNG for screenshots, logos and anything with transparency, and WebP for the smallest files on websites.' },
      { q: 'Why was my file rejected even though it ends in .jpg?', a: 'We check the actual content of each file. If a file was renamed (for example a PDF or an HTML page saved with a .jpg extension), it is not an image and is rejected for safety.' },
      { q: 'Can I convert AVIF images?', a: 'Yes, in any browser that can display AVIF (current Chrome, Edge, Firefox and Safari 16+).' },
    ],
  },

  'heic-to-jpg': {
    intro: [
      'iPhones and iPads save photos as HEIC by default. The format is efficient, but Windows apps, many websites and older software cannot open it. Converting to JPG makes the photo readable everywhere.',
      'On Safari, the conversion uses Apple’s own built-in decoder. Other browsers (Chrome, Edge, Firefox) cannot decode HEIC on their own, so a decoder (libheif) is downloaded from this site the first time you convert — your photos are processed by it locally and are not uploaded.',
    ],
    steps: [
      'Choose or drop your .heic / .heif photos (you can select many at once).',
      'Conversion to JPG starts immediately at 90% quality. Change the quality or pick PNG if you prefer.',
      'Download the JPGs one by one or all together as a ZIP.',
    ],
    useCases: [
      { title: 'Opening iPhone photos on Windows', text: 'Convert photos copied from an iPhone so they open in any Windows app, older photo viewers and editors.' },
      { title: 'Uploading to websites', text: 'Many upload forms reject .heic files. JPG is accepted virtually everywhere.' },
      { title: 'Sharing without location', text: 'Converted JPGs contain no EXIF data, so the GPS location stored in the original HEIC is not passed on.' },
    ],
    specs: [
      ['Input formats', 'HEIC, HEIF (still images; the primary image of a burst/Live Photo)'],
      ['Output formats', 'JPG (default) or PNG'],
      ['Decoder', 'Browser/OS decoder when available (Safari); otherwise libheif compiled to JavaScript, loaded on demand (~3 MB, cached afterwards)'],
      ['Orientation', 'Rotation stored in the HEIC file is applied, so photos stay upright'],
      ['Metadata', 'Output contains no EXIF/GPS metadata'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'The first conversion in Chrome/Edge/Firefox downloads the decoder (~3 MB), which can take a few seconds on slow connections.',
      'Colours are converted to standard sRGB; iPhone photos captured in Display P3 may look marginally less vivid on wide-gamut displays.',
      'Only the main image is converted — depth maps, Live Photo video and burst frames are not.',
      'Very large HEIC images (e.g. 48 MP) are scaled down on iPhone/iPad to fit browser memory limits; a note is shown when this happens.',
    ],
    faq: [
      { q: 'Are my iPhone photos uploaded?', a: 'No. Decoding and JPG encoding run in your browser. Only the decoder program itself is downloaded from this site; your photos never leave the device.' },
      { q: 'Will I lose quality converting HEIC to JPG?', a: 'JPG uses lossy compression, but at the default 90% quality the difference is not visible in normal use. The JPG file will usually be larger than the HEIC.' },
      { q: 'How can I stop my iPhone from taking HEIC photos?', a: 'In Settings → Camera → Formats, choose “Most Compatible”. New photos are then saved as JPG. Existing photos stay HEIC.' },
      { q: 'Can I convert HEIC to PNG instead?', a: 'Yes — choose PNG under “Convert to”. PNG is lossless but produces much larger files for photos.' },
      { q: 'Does this work on an iPhone?', a: 'Yes. On iPhone and iPad, Safari decodes HEIC natively, so conversion is fast and needs no extra download.' },
    ],
  },

  'webp-to-jpg': {
    intro: [
      'Many websites serve images as WebP, so “Save image as…” often gives you a .webp file that older apps, some editors and many upload forms refuse. This converter turns WebP into a standard JPG (or PNG).',
      'WebP images can have transparent areas; JPG cannot. You can choose which colour fills those areas — white by default.',
    ],
    steps: [
      'Choose or drop one or more .webp files.',
      'They are converted to JPG at 90% quality right away. Change the quality or background colour if needed.',
      'Download the JPGs individually or as a ZIP.',
    ],
    useCases: [
      { title: 'Images saved from websites', text: 'Make images downloaded from the web usable in Word, older photo editors and print services.' },
      { title: 'Upload forms', text: 'Convert WebP to JPG for sites that only accept JPG or PNG.' },
      { title: 'Transparent WebP to PNG', text: 'Choose PNG output instead of JPG to keep a transparent background.' },
    ],
    specs: [
      ['Input formats', 'WebP (lossy, lossless, with alpha; animated → first frame)'],
      ['Output formats', 'JPG (default) or PNG'],
      ['Transparency', 'Filled with white, black or a custom colour for JPG; kept for PNG'],
      ['Quality', '30–100% (default 90%)'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Animated WebP files are converted as a single still image (the first frame).',
      'The JPG may be larger than the WebP — WebP compresses more efficiently.',
    ],
    faq: [
      { q: 'Why do websites use WebP?', a: 'WebP files are usually 25–35% smaller than JPGs of similar quality, so pages load faster. All current browsers support it, but some desktop software still does not.' },
      { q: 'Does converting WebP to JPG reduce quality?', a: 'JPG is lossy, so there is a small loss; at 90% quality it is not noticeable for typical images. Choose PNG output for a lossless copy.' },
      { q: 'Can I convert WebP to PNG here?', a: 'Yes. Select PNG under “Convert to”. Transparency is preserved.' },
    ],
  },

  'png-to-jpg': {
    intro: [
      'PNG is lossless, which makes photos and screenshots of photos large. Converting to JPG usually makes them several times smaller, and JPG is the format most upload forms ask for.',
      'Because JPG cannot store transparency, any transparent pixels are filled with a colour you choose. White is the default; pick black or any custom colour for logos on dark backgrounds.',
    ],
    steps: [
      'Choose or drop your PNG files.',
      'Choose the background colour for transparent areas and the JPG quality.',
      'Download each JPG, or all of them as a ZIP.',
    ],
    useCases: [
      { title: 'Screenshots with photos', text: 'A PNG screenshot of a photo or video frame is often 3–10× smaller as a JPG.' },
      { title: 'Forms that require JPG', text: 'Convert scans or images exported from design tools into JPG for application forms.' },
      { title: 'Logos on coloured backgrounds', text: 'Set the background colour to match where the image will be placed.' },
    ],
    specs: [
      ['Input format', 'PNG (including transparent and 16-bit PNG; APNG → first frame)'],
      ['Output format', 'JPG'],
      ['Transparency', 'Filled with your chosen colour (default white)'],
      ['Quality', '30–100% (default 90%)'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Text and sharp lines can show slight halos in JPG. For screenshots of text, the Image Compressor’s PNG colour reduction often gives better results.',
      'Transparency cannot be preserved in JPG — use WebP if you need a small file with transparency.',
    ],
    faq: [
      { q: 'Why is my JPG smaller than the PNG?', a: 'JPG discards detail the eye barely notices in photographic content, while PNG stores every pixel exactly. For photos this typically saves 70–90%.' },
      { q: 'What happens to the transparent background?', a: 'It is replaced by the background colour you choose. If you need transparency, convert to WebP instead, or keep the PNG.' },
      { q: 'Can I convert PNG to JPG without losing quality?', a: 'At 95–100% quality the JPG is visually identical for photos, but the file savings are smaller. 85–90% is a good balance.' },
    ],
  },

  'jpg-to-png': {
    intro: [
      'PNG is lossless: once your image is a PNG, further edits and saves will not add new compression artifacts. Some apps, print services and design tools also require PNG.',
      'Two common misunderstandings are worth knowing: converting a JPG to PNG does not restore detail that JPG compression already removed, and it does not make the background transparent. The PNG will look exactly like the JPG — and it will be several times larger.',
    ],
    steps: [
      'Choose or drop your JPG files.',
      'Each image is converted to PNG immediately.',
      'Download the PNGs one at a time or as a ZIP.',
    ],
    useCases: [
      { title: 'Editing without further loss', text: 'Convert to PNG before repeatedly editing and saving an image, so each save does not degrade it further.' },
      { title: 'Apps that require PNG', text: 'Some icon, sticker and design tools only accept PNG uploads.' },
      { title: 'Before removing a background', text: 'PNG supports transparency, so it is the right format to keep if you later cut out the background in an editor.' },
    ],
    specs: [
      ['Input format', 'JPG / JPEG (EXIF orientation applied)'],
      ['Output format', 'PNG (lossless, 8 bits per channel)'],
      ['Typical size change', '3–8× larger than the JPG for photos'],
      ['Metadata', 'Output contains no EXIF/GPS metadata'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Quality is not improved: artifacts already in the JPG remain in the PNG.',
      'The background stays opaque. Making it transparent requires a background-removal tool.',
      'CMYK JPGs are converted to RGB.',
    ],
    faq: [
      { q: 'Does converting JPG to PNG improve quality?', a: 'No. PNG preserves the image exactly as it is, including any compression artifacts. It only prevents further loss from future saves.' },
      { q: 'Will my JPG get a transparent background?', a: 'No. JPG has no transparency information, so the PNG is fully opaque. You would need to remove the background in an image editor.' },
      { q: 'Why is the PNG so much bigger?', a: 'PNG stores every pixel losslessly. Photos contain lots of fine variation, which lossless compression cannot shrink much.' },
    ],
  },

  'image-to-webp': {
    intro: [
      'WebP images are typically 25–35% smaller than JPGs of similar quality, and lossless WebP is usually smaller than PNG — a simple way to speed up a website or blog.',
      'Safari (and every browser on iPhone and iPad) cannot create WebP files on its own and silently falls back to PNG. This tool detects that and uses a built-in WebAssembly WebP encoder instead, so you always get a real .webp file.',
    ],
    steps: [
      'Choose or drop JPG, PNG, BMP or GIF files.',
      'They are converted to WebP at 80% quality. Turn on “Lossless WebP” for logos, icons and screenshots.',
      'Compare sizes and download individually or as a ZIP.',
    ],
    useCases: [
      { title: 'Website speed', text: 'Serving WebP instead of JPG/PNG reduces page weight and improves loading metrics such as Largest Contentful Paint.' },
      { title: 'Transparent graphics', text: 'Convert transparent PNG logos to WebP — transparency is kept in both lossy and lossless mode.' },
      { title: 'Blogs and CMS uploads', text: 'Most modern CMSs accept WebP; convert before uploading to save storage and bandwidth.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, BMP, GIF (first frame)'],
      ['Output format', 'WebP — lossy (quality 30–100%) or lossless'],
      ['Encoder', 'Browser encoder where available; libwebp (WebAssembly) on Safari/iOS and for lossless mode'],
      ['Transparency', 'Preserved'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'Animated GIFs become a still WebP (first frame).',
      'Re-encoding an already heavily compressed JPG can occasionally produce a larger WebP at high quality settings — lower the quality or keep the JPG.',
      'Some older software (and some email clients) cannot open WebP; keep your originals.',
    ],
    faq: [
      { q: 'Lossy or lossless WebP — which should I use?', a: 'Lossy for photos (much smaller). Lossless for screenshots, logos, icons and illustrations with flat colours and sharp edges.' },
      { q: 'Does WebP work in all browsers?', a: 'Yes — all current versions of Chrome, Edge, Firefox and Safari display WebP. Very old browsers (e.g. Internet Explorer) do not.' },
      { q: 'Does this really create WebP on iPhone?', a: 'Yes. When the browser cannot encode WebP, the tool uses a WebAssembly build of Google’s libwebp that runs locally on your device.' },
    ],
  },

  'image-to-pdf': {
    intro: [
      'Combine photos, scans and screenshots into one PDF — for example to submit documents, send receipts or archive notes. Put the pages in the order you want, then choose the page size and margins.',
      'JPG photos are embedded in the PDF exactly as they are, without being re-compressed, so there is no quality loss. PNG images are embedded losslessly. Other formats (HEIC, WebP, AVIF) are converted to high-quality JPG first.',
    ],
    steps: [
      'Choose or drop your images. Add more at any time.',
      'Reorder pages with the ↑ ↓ buttons and remove any you do not need.',
      'Choose A4, US Letter or “Same as each image”, the orientation and the margin, then press “Create PDF” and download it.',
    ],
    useCases: [
      { title: 'Submitting documents', text: 'Turn phone photos of an ID, certificate or form into a single PDF for an application.' },
      { title: 'Receipts and expenses', text: 'Collect photos of receipts into one PDF per month for accounting.' },
      { title: 'Notes and whiteboards', text: 'Combine photos of handwritten notes or a whiteboard into a document you can share.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP'],
      ['Page size', 'A4, US Letter, or matching each image (96 px per inch)'],
      ['Orientation', 'Automatic per image, or fixed portrait/landscape'],
      ['Margins', 'None, small (0.25 in) or large (0.5 in)'],
      ['Image quality', 'JPG embedded without recompression; PNG lossless; others converted to 92% JPG'],
      ['Maximum', '50 images per PDF, 100 MB per image'],
      PRIVACY_SPEC,
    ],
    limits: [
      'The PDF contains images, not searchable text (no OCR).',
      'Large photos make large PDFs. If the result must be small, use “Compress to exact KB” or the Resizer on the images first.',
      'JPGs with a rotation flag (EXIF orientation) are re-encoded at high quality so they appear upright.',
    ],
    faq: [
      { q: 'How do I convert multiple JPGs into one PDF?', a: 'Select all the JPG files at once (or add them in several steps), arrange the order, and press “Create PDF”. Each image becomes one page.' },
      { q: 'Will the images lose quality?', a: 'JPG files are copied into the PDF byte-for-byte, and PNG files losslessly, so their quality is unchanged. Other formats are converted to JPG at 92% quality.' },
      { q: 'Can I make a PDF on my phone?', a: 'Yes. The tool works in mobile browsers, and you can pick photos directly from your gallery.' },
      { q: 'Is there a page limit?', a: 'You can combine up to 50 images per PDF. Very large photos use more memory, especially on phones.' },
    ],
  },

  'image-cropper': {
    intro: [
      'Crop a photo to exactly the area you need: drag the frame or its handles (works with touch), choose a fixed aspect ratio such as 1:1 for profile pictures or 16:9 for thumbnails, or type the position and size in pixels for precise results.',
      'The crop is applied to the full-resolution image, not to the smaller preview you see on screen.',
    ],
    steps: [
      'Choose or drop an image.',
      'Pick an aspect ratio (or Free), then drag the frame and its corners — or enter X, Y, width and height.',
      'Press “Crop image” and download or copy the result.',
    ],
    useCases: [
      { title: 'Profile pictures', text: 'Use 1:1 to get a centred square for social profiles, messaging apps and ID photos.' },
      { title: 'Social posts and thumbnails', text: '4:5 for portrait feed posts, 9:16 for stories, 16:9 for video thumbnails and presentations.' },
      { title: 'Removing distractions', text: 'Cut away edges, people in the background or parts of a screenshot you do not want to share.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP'],
      ['Aspect presets', 'Free, original, 1:1, 4:3, 3:2, 16:9, 9:16, 4:5'],
      ['Precision', 'Whole pixels in the original image'],
      ['Output', 'Same format as the original (HEIC/AVIF → JPG), or JPG/PNG/WebP'],
      ['Keyboard', 'Arrow keys move the frame; Shift + arrow keys resize it'],
      PRIVACY_SPEC,
    ],
    limits: [
      'One image at a time.',
      'JPG and WebP outputs are re-encoded at 92% quality; choose PNG for a lossless result.',
    ],
    faq: [
      { q: 'How do I crop a picture into a square?', a: 'Select the 1:1 aspect ratio. A centred square appears; drag it to the right spot, resize it with the corners, then press “Crop image”.' },
      { q: 'Does cropping reduce quality?', a: 'The crop itself keeps the original pixels. The result is saved at 92% quality for JPG/WebP, which is visually identical; choose PNG for a lossless copy.' },
      { q: 'Can I crop to exact pixel dimensions?', a: 'Yes. Enter X, Y, width and height in the number fields. To also change the final pixel size, resize the cropped image afterwards with the Image Resizer.' },
    ],
  },

  'rotate-image': {
    intro: [
      'Rotate photos by 90° or 180°, or mirror them horizontally or vertically — for example a sideways phone photo, an upside-down scan, or a mirrored selfie. The same change is applied to every image you add, so a whole batch of scans can be fixed at once.',
      'A live preview of the first image shows the result before you apply it.',
    ],
    steps: [
      'Choose or drop one or more images.',
      'Use the rotate and flip buttons until the preview looks right.',
      'Press “Rotate”, then download the images individually or as a ZIP.',
    ],
    useCases: [
      { title: 'Sideways phone photos', text: 'Fix photos that appear rotated in some apps or on websites.' },
      { title: 'Scanned documents', text: 'Turn a batch of scans that were fed in upside down.' },
      { title: 'Mirrored selfies', text: 'Flip front-camera photos horizontally so text reads correctly.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP, HEIC/HEIF, AVIF, GIF (first frame), BMP'],
      ['Operations', 'Rotate 90° left/right, 180°, flip horizontal, flip vertical (combinable)'],
      ['Output', 'Same format (HEIC/AVIF → JPG, GIF/BMP → PNG); JPG/WebP saved at 92% quality'],
      ['EXIF orientation', 'Applied first, so the rotation is relative to how the photo normally appears'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'JPG files are re-encoded (at 92% quality), so rotation is not bit-for-bit lossless.',
      'All images in a batch receive the same rotation.',
    ],
    faq: [
      { q: 'Why does my photo look sideways on some sites but not on my phone?', a: 'Phones often store photos unrotated plus a small “orientation” tag. Apps that ignore the tag show the photo sideways. Rotating here writes the pixels in the correct orientation, so it looks right everywhere.' },
      { q: 'What is the difference between rotating and flipping?', a: 'Rotating turns the image around its centre. Flipping mirrors it — horizontally (left↔right) or vertically (top↔bottom).' },
      { q: 'Can I rotate several images at once?', a: 'Yes, up to 50. Every image receives the same rotation and flip.' },
    ],
  },

  'exif-viewer': {
    intro: [
      'Photos from phones and cameras carry hidden metadata: the camera and lens, the exact date and time, exposure settings, the software used — and often the GPS coordinates of where the photo was taken. This viewer shows all of it, and warns you clearly if a location is embedded.',
      'The file is read locally by your browser. Nothing is uploaded, which matters for exactly the kind of personal photos you might want to check.',
    ],
    steps: [
      'Choose or drop a photo (JPG, HEIC, PNG, WebP, AVIF or TIFF).',
      'Read the summary and the GPS check at the top; open the groups below for every field.',
      'Copy the metadata as text, download it as JSON, or remove it with the Remove EXIF tool.',
    ],
    useCases: [
      { title: 'Before sharing a photo', text: 'Check whether a photo reveals your home location before posting it or selling something online.' },
      { title: 'Photography', text: 'See the shutter speed, aperture, ISO and lens used for a shot.' },
      { title: 'Checking an image’s origin', text: 'Look at the date, device and editing software recorded in a file. Metadata can be edited, so treat it as a clue, not proof.' },
    ],
    specs: [
      ['Input formats', 'JPG, HEIC/HEIF, PNG, WebP, AVIF, TIFF'],
      ['Metadata read', 'EXIF (IFD0, EXIF, GPS, interoperability, thumbnail), XMP, IPTC, ICC profile, JFIF, PNG header'],
      ['Export', 'Copy as text or download as JSON'],
      ['Parser', 'exifr (open source), running in your browser'],
      PRIVACY_SPEC,
    ],
    limits: [
      'Manufacturer-specific “MakerNote” data is not decoded.',
      'Screenshots and images downloaded from social networks usually contain little or no metadata, because those services remove it.',
      'The map link opens openstreetmap.org and shares only the coordinates you choose to view.',
    ],
    faq: [
      { q: 'How can I tell if a photo has GPS location data?', a: 'Open it here: a highlighted message at the top says whether GPS coordinates were found, and shows them.' },
      { q: 'What is EXIF data?', a: 'EXIF is a standard for storing information inside image files: camera settings, date and time, orientation, and optionally location. It is written automatically by cameras and phones.' },
      { q: 'Do social networks remove EXIF data?', a: 'Most large platforms strip location data from public images, but files sent by email, messaging apps set to send “original quality”, cloud links or marketplaces may keep it.' },
      { q: 'How do I remove the metadata?', a: 'Use the Remove EXIF tool. It deletes the metadata without re-compressing the image.' },
    ],
  },

  'remove-exif': {
    intro: [
      'Photos can reveal where you live or work through GPS coordinates stored in their EXIF metadata, along with the camera serial, date and editing history. This tool deletes that metadata before you share a photo.',
      'Unlike tools that re-save the image, the metadata is cut out of the file directly: the compressed image data is copied byte-for-byte, so there is zero quality loss and the file only gets smaller.',
    ],
    steps: [
      'Choose or drop your JPG, PNG or WebP photos.',
      'Metadata is removed immediately. Each result lists exactly what was removed.',
      'Download the cleaned files (named “…-clean”) individually or as a ZIP.',
    ],
    useCases: [
      { title: 'Selling items online', text: 'Photos taken at home can reveal your address. Clean them before posting to marketplaces.' },
      { title: 'Sharing via email or chat', text: 'Many messaging apps and email send the original file with all metadata. Remove it first.' },
      { title: 'Publishing on your website', text: 'Strip camera details and editing history from images before uploading them to a blog or CMS.' },
    ],
    specs: [
      ['Input formats', 'JPG, PNG, WebP'],
      ['Removed', 'EXIF (incl. GPS, camera, dates), XMP, IPTC/Photoshop data, comments, PNG text chunks, timestamps and data hidden after the end of the image'],
      ['Kept (optional)', 'Orientation flag (so photos stay upright) and ICC colour profile (so colours stay accurate)'],
      ['Image quality', 'Unchanged — no re-encoding'],
      PRIVACY_SPEC,
      SIZE_SPEC,
    ],
    limits: [
      'HEIC files cannot be cleaned losslessly here. Convert them with HEIC to JPG — the converted JPG has no metadata at all.',
      'Metadata is not the only way to identify a photo’s location: landmarks, street signs and reflections in the picture itself are not removed.',
      'Embedded preview images, depth maps and HDR gain maps stored after the main JPG image are removed, so some phone-specific effects (e.g. HDR display boost) may not appear.',
    ],
    faq: [
      { q: 'Does removing EXIF data reduce image quality?', a: 'No. Only the metadata blocks are removed; the compressed image data is copied unchanged, so the picture is bit-for-bit identical.' },
      { q: 'Why keep the orientation flag?', a: 'Many phones store photos sideways and rely on this flag to display them upright. It contains only a number from 1 to 8, not personal information. Turn it off to remove it too.' },
      { q: 'How do I check that the location is really gone?', a: 'Open the cleaned file in our EXIF Viewer — it will report “No GPS location found”.' },
      { q: 'Do my photos get uploaded to remove the data?', a: 'No. The files are read and rewritten by your browser on your device. That is the point: you should not have to upload a private photo to make it private.' },
    ],
  },
};
