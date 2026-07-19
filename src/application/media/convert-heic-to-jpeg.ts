const JPEG_QUALITY = 0.85;

export async function convertHeicBufferToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default;
    return await sharp(buffer).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  } catch {
    const convertModule = await import('heic-convert');
    const convert = convertModule.default ?? convertModule;
    const converted = await convert({
      buffer,
      format: 'JPEG',
      quality: JPEG_QUALITY,
    });

    return Buffer.from(converted);
  }
}
