import { mkdir, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';

export const FIX = 'tests/e2e/.cache';

async function gradient(width: number, height: number, alpha = false) {
  const channels = alpha ? 4 : 3;
  const data = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      data[i] = (x * 255) / width;
      data[i + 1] = (y * 255) / height;
      data[i + 2] = ((x * y) % 255) | 0;
      if (alpha) data[i + 3] = x < width / 2 ? 255 : 0;
    }
  return sharp(data, { raw: { width, height, channels } });
}

/** Photo-like noisy content so compression behaves realistically. */
async function noisy(width: number, height: number) {
  const data = Buffer.alloc(width * height * 3);
  let seed = 42;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    data[i] = ((i / 3) % width) / 4 + (seed % 90);
  }
  return sharp(data, { raw: { width, height, channels: 3 } });
}

export default async function globalSetup() {
  await mkdir(FIX, { recursive: true });
  const write = (name: string, buf: Buffer | Uint8Array) => writeFile(`${FIX}/${name}`, buf);

  await write('photo.jpg', await (await noisy(1600, 1200)).jpeg({ quality: 95 }).withMetadata({ orientation: 1 }).withExif({
    IFD0: { Make: 'TestCam', Model: 'E2E' },
    IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '35/1 41/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '139/1 41/1 0/1' },
  }).toBuffer());
  await write('rotated.jpg', await (await gradient(300, 200)).jpeg().withMetadata({ orientation: 6 }).toBuffer());
  await write('small.png', await (await gradient(64, 48, true)).png().toBuffer());
  await write('graphic.png', await (await gradient(800, 600, true)).png().toBuffer());
  await write('image.webp', await (await gradient(640, 480, true)).webp({ quality: 80 }).toBuffer());
  await write('image.gif', await (await gradient(120, 80)).gif().toBuffer());
  await write('tiny.jpg', await (await gradient(1, 1)).jpeg().toBuffer());
  await write('large.jpg', await (await noisy(5000, 4000)).jpeg({ quality: 92 }).toBuffer());
  await write('写真 テスト <x>&"quote".jpg', await (await gradient(200, 100)).jpeg().toBuffer());
  await write('empty.jpg', Buffer.alloc(0));
  await write('corrupt.jpg', Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000, 7)]));
  await write('fake.jpg', Buffer.from('<html><script>alert(1)</script></html>'));
  await write('evil.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script></svg>'));
  await write('notes.txt', Buffer.from('just text'));
  // PNG header claiming 60000 × 60000 px (3.6 gigapixels) — must be rejected before decoding.
  const bomb = Buffer.from(await (await gradient(8, 8)).png().toBuffer());
  bomb.writeUInt32BE(60000, 16);
  bomb.writeUInt32BE(60000, 20);
  await write('bomb.png', bomb);

  try {
    await access(`${FIX}/example.heic`);
  } catch {
    try {
      const res = await fetch('https://raw.githubusercontent.com/strukturag/libheif/master/examples/example.heic');
      if (res.ok) await write('example.heic', new Uint8Array(await res.arrayBuffer()));
    } catch {
      console.warn('Could not download the sample HEIC file; HEIC tests will be skipped.');
    }
  }
}
