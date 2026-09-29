import sharp from 'sharp';

/** A small gradient RGB image so encoders produce realistic data. */
export async function rgbRaw(width: number, height: number, alpha = false) {
  const channels = alpha ? 4 : 3;
  const data = Buffer.alloc(width * height * channels);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      data[i] = (x * 255) / width;
      data[i + 1] = (y * 255) / height;
      data[i + 2] = ((x + y) * 127) / (width + height);
      if (alpha) data[i + 3] = x < width / 2 ? 255 : 64;
    }
  }
  return sharp(data, { raw: { width, height, channels } });
}

export const GPS_EXIF = {
  IFD0: { Make: 'TestCam', Model: 'Model X', Artist: 'Jane Doe' },
  IFD2: { DateTimeOriginal: '2024:05:01 10:20:30' },
  IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '35/1 41/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '139/1 41/1 0/1' },
};

export async function jpegWithGps(width = 64, height = 48): Promise<Uint8Array> {
  const img = await rgbRaw(width, height);
  const buf = await img.jpeg({ quality: 85 }).withMetadata({ orientation: 6 }).withExif(GPS_EXIF).toBuffer();
  return new Uint8Array(buf);
}

export async function pngWithText(width = 32, height = 32): Promise<Uint8Array> {
  const img = await rgbRaw(width, height, true);
  const buf = await img.png().withExif(GPS_EXIF).withXmp('<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>Jane</dc:creator></rdf:Description></rdf:RDF></x:xmpmeta>').toBuffer();
  return new Uint8Array(buf);
}

export async function webpWithExif(width = 40, height = 30): Promise<Uint8Array> {
  const img = await rgbRaw(width, height);
  const buf = await img.webp({ quality: 80 }).withExif(GPS_EXIF).toBuffer();
  return new Uint8Array(buf);
}

export async function rawPixels(bytes: Uint8Array) {
  return sharp(Buffer.from(bytes)).raw().toBuffer({ resolveWithObject: true });
}
