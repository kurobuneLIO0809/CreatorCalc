/** Local download/clipboard helpers. Blobs never leave the browser. */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give slow devices time to start the download before freeing memory.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function canCopyImage(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.clipboard?.write && typeof ClipboardItem !== 'undefined';
}

async function toPng(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0;
  if (!png) throw new Error('Could not prepare the image for the clipboard.');
  return png;
}

/** Copies an image to the clipboard (browsers only accept PNG, so other formats are converted). */
export async function copyImageToClipboard(blob: Blob): Promise<void> {
  // Passing a promise keeps the user-gesture requirement satisfied in Safari.
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': toPng(blob) })]);
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
